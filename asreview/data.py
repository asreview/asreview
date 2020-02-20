class ASReviewData(object):
    """Data object to store csv/ris file.

    Extracts relevant properties of papers."""

    def __init__(self,
                 raw_df,
                 labels=None,
                 title=None,
                 abstract=None,
                 keywords=None,
                 article_id=None,
                 authors=None,
                 label_col=LABEL_INCLUDED_VALUES[0],
                 final_labels=None):
        self.raw_df = raw_df
        self.labels = labels
        self.title = title
        self.abstract = abstract
        self.label_col = label_col
        self.keywords = keywords
        self.article_id = article_id
        self.authors = authors
        self.final_labels = final_labels

        if authors is None:
            logging.warning("Could not locate authors in data.")
        if title is None:
            BadFileFormatError("Could not locate titles in data.")
        if abstract is None:
            BadFileFormatError("Could not locate abstracts in data.")

        self.n_paper_train = len(self.raw_df.index)
        self.n_paper = self.n_paper_train
        if article_id is None:
            self.article_id = np.arange(len(raw_df.index))

    def append(self, as_data):
        """Append another ASReviewData object.

        It puts the training data at the end.

        Arguments
        ---------
        as_data: ASReviewData
            Dataset to append.
        """
        if as_data.labels is None:
            BadFileFormatError("Additional datasets should have labels.")
        if self.labels is None:
            self.labels = np.full(self.n_paper, NOT_AVAILABLE)
        self.labels = np.append(self.labels, as_data.labels)

        self.title = np.append(self.title, as_data.title)
        self.abstract = np.append(self.abstract, as_data.abstract)
        self.article_id = np.append(self.article_id,
                                    as_data.article_id + self.n_paper)
        self.keywords = merge_arrays(self.keywords, as_data.keywords,
                                     self.n_paper, as_data.n_paper, "", object)
        self.authors = merge_arrays(self.authors, as_data.authors,
                                    self.n_paper, as_data.n_paper, "", object)
        self.final_labels = merge_arrays(
            self.final_labels, as_data.final_labels, self.n_paper,
            as_data.n_paper, NOT_AVAILABLE, np.int)

        self.raw_df = pd.concat([self.raw_df, as_data.raw_df], join='outer',
                                sort=False, ignore_index=True)
        self.n_paper += as_data.n_paper

    @classmethod
    def from_data_frame(cls, raw_df, abstract_only=False):
        """Get a review data object from a pandas dataframe."""
        # extract the label column
        column_labels = [
            label for label in list(raw_df) if label in LABEL_INCLUDED_VALUES
        ]

        if len(column_labels) > 1:
            print('\x1b[0;30;41m Warning multiple valid label inclusion '
                  'columns detected. \x1b[0m')
            print(f'Possible values: {column_labels}.')
            print(f'Choosing the one with the highest priority: '
                  f'{column_labels[0]}')
        data_kwargs = {"raw_df": raw_df}

        if len(column_labels) > 0:
            data_kwargs['labels'] = np.array(
                raw_df[column_labels[0]].fillna(NOT_AVAILABLE).values,
                dtype=np.int)
            data_kwargs['label_col'] = column_labels[0]
        else:
            data_kwargs['label_col'] = LABEL_INCLUDED_VALUES[0]

        if 'inclusion_code' in raw_df.columns and abstract_only:
            inclusion_codes = raw_df['inclusion_code'].fillna(
                NOT_AVAILABLE).values
            inclusion_codes = np.array(inclusion_codes, dtype=np.int)
            data_kwargs['final_labels'] = data_kwargs['labels']
            data_kwargs['labels'] = inclusion_codes > 0

        def fill_column(dst_dict, keys):
            if not isinstance(keys, list):
                keys = [keys]
            dst_key = keys[0]
            df_columns = {
                str(col_name).lower(): col_name
                for col_name in list(raw_df)
            }
            for key in keys:
                try:
                    dst_dict[dst_key] = raw_df[df_columns[key]].fillna(
                        '').values
                except KeyError:
                    pass

        for key in [['title', 'primary_title'],
                    ['authors', 'author names', 'first_authors'], 'abstract',
                    'keywords']:
            fill_column(data_kwargs, key)

        return cls(**data_kwargs)

    @classmethod
    def from_csv(cls, fp, *args, **kwargs):
        return cls.from_data_frame(pd.DataFrame(read_csv(fp)), *args, **kwargs)

    @classmethod
    def from_ris(cls, fp, *args, **kwargs):
        return cls.from_data_frame(pd.DataFrame(read_ris(fp)), *args, **kwargs)

    @classmethod
    def from_excel(cls, fp, *args, **kwargs):
        return cls.from_data_frame(
            pd.DataFrame(read_excel(fp)), *args, **kwargs)

    @classmethod
    def from_file(cls, fp, *args, extra_dataset=[], **kwargs):
        "Create instance from csv/ris/excel file."
        as_data = cls.from_data_frame(_df_from_file(fp), *args, **kwargs)

        if len(extra_dataset) == 0:
            return as_data

        for prior_fp in extra_dataset:
            prior_as_data = cls.from_data_frame(
                _df_from_file(prior_fp), *args, **kwargs)
            as_data.append(prior_as_data)
        return as_data

    def fuzzy_find(self, keywords, threshold=50, max_return=10, exclude=None):
        """Find a record using keywords.

        It looks for keywords in the title/authors/keywords
        (for as much is available). Using the fuzzywuzzy package it creates
        a ranking based on token set matching.

        Arguments
        ---------
        keywords: str
            A string of keywords together, can be a combination.
        threshold: float
            Don't return records below this threshold.
        max_return: int
            Maximum number of records to return.

        Returns
        -------
        list:
            Sorted list of indexes that match best the keywords.
        """
        match_str = np.full(self.title.shape, "x", dtype=object)

        if self.title is not None:
            for i, title in enumerate(self.title):
                match_str[i, ] = str(title) + " "
        if self.authors is not None:
            for i in range(len(self.authors)):
                match_str[i] += format_to_str(self.authors[i]) + " "
        if self.keywords is not None:
            if isinstance(self.keywords[0], list):
                new_keywords = np.array([" ".join(x) for x in self.keywords])
            else:
                new_keywords = self.keywords
            for i in range(len(new_keywords)):
                match_str[i] += str(new_keywords[i])

        new_ranking = get_fuzzy_ranking(keywords, match_str)
        sorted_idx = np.argsort(-new_ranking)
        best_idx = []
        for idx in sorted_idx:
            if idx in exclude:
                continue
            if len(best_idx) >= max_return:
                break
            if len(best_idx) > 0 and new_ranking[idx] < threshold:
                break
            best_idx.append(idx)
        return np.array(best_idx, dtype=np.int).tolist()

    @property
    def texts(self):
        return [
            self.title[i] + " " + self.abstract[i]
            for i in range(len(self.title))
        ]

    def get_priors(self):
        "Get prior_included, prior_excluded from dataset."
        zero_idx = np.where(self.labels[self.n_paper_train:] == 0)[0]
        one_idx = np.where(self.labels[self.n_paper_train:] == 1)[0]
        return one_idx + self.n_paper_train, zero_idx + self.n_paper_train

    def to_file(self, fp, labels=None, df_order=None):
        """
        Export data object to file.
        Both RIS and CSV are supported file formats at the moment.

        Arguments
        ---------
        fp: str
            Filepath to export to.
        labels: list, np.array
            Labels to be inserted into the dataframe before export.
        df_order: list, np.array
            Optionally, dataframe rows can be reordered.
        """
        if Path(fp).suffix in [".csv", ".CSV"]:
            self.to_csv(fp, labels=labels, df_order=df_order)
        elif Path(fp).suffix in [".ris", ".RIS"]:
            self.to_ris(fp, labels=labels, df_order=df_order)
        else:
            raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                             f"from file {fp}")

    def to_csv(self, csv_fp, labels=None, df_order=None):
        new_df = self.raw_df.copy()
        if labels is not None:
            new_df[self.label_col] = labels

        if df_order is not None:
            new_df = new_df.reindex(df_order)
        new_df.to_csv(csv_fp)

    def to_ris(self, ris_fp, labels=None, df_order=None):
        new_df = self.raw_df.copy()
        if labels is not None:
            new_df[self.label_col] = labels

        if df_order is not None:
            new_df = new_df.reindex(df_order)
        write_ris(new_df, ris_fp)

