import xml.etree.ElementTree as ET

import pandas as pd

from asreview.io.utils import _standardize_dataframe


class EndnoteXMLReader:
    """Endnote XML file reader."""

    read_format = [".xml"]
    write_format = [".csv", ".tsv", ".xlsx"]

    @classmethod
    def read_data(cls, fp):
        """Import dataset from Endnote XML file.

        Arguments
        ---------
        fp: str, pathlib.Path
            File path to the XML file.

        Returns
        -------
        list:
            List with entries.
        """
        tree = ET.parse(fp)
        root = tree.getroot()
        dataset_list = []
        for i, record in enumerate(root[0]):
            try:
                record_id = record.find("rec-number").text
            except (AttributeError, TypeError):
                record_id = None
            try:
                ref_type = record.find("ref-type").attrib["name"]
            except (AttributeError, TypeError):
                ref_type = None
            try:
                authors = ", ".join(
                    author[0].text
                    for author in record.find("contributors").find("authors")
                )
            except (AttributeError, TypeError):
                authors = None
            try:
                title = record.find("titles").find("title")[0].text
            except (AttributeError, TypeError):
                title = None
            try:
                second_title = record.find("titles").find("secondary-title")[0].text
            except (AttributeError, TypeError):
                second_title = None
            try:
                journal = record.find("periodical").find("full-title")[0].text
            except (AttributeError, TypeError):
                journal = None
            try:
                doi = record.find("electronic-resource-num")[0].text
            except (AttributeError, TypeError):
                doi = None
            try:
                pages = record.find("pages")[0].text
            except (AttributeError, TypeError):
                pages = None
            try:
                volume = record.find("volume")[0].text
            except (AttributeError, TypeError):
                volume = None
            try:
                number = record.find("number")[0].text
            except (AttributeError, TypeError):
                number = None
            try:
                year = record.find("dates").find("year")[0].text
            except (AttributeError, TypeError):
                year = None
            try:
                url = record.find("urls").find("related-urls").find("url")[0].text
            except (AttributeError, TypeError):
                url = None
            try:
                isbn = record.find("isbn")[0].text
            except (AttributeError, TypeError):
                isbn = None
            try:
                abstract = record.find("abstract")[0].text
            except (AttributeError, TypeError):
                abstract = None
            # try:
            #     label = record.find("label")[0].text
            # except (AttributeError, TypeError):
            #     label = None
            dataset_list.append(
                {
                    "recordID": record_id,
                    # record_id is overwritten by ASReview standardize_dataframe
                    "ref_type": ref_type,
                    "authors": authors,
                    "title": title,
                    "year": year,
                    "journal": journal,
                    "secondary_title": second_title,
                    "doi": doi,
                    "pages": pages,
                    "volume": volume,
                    "number": number,
                    "abstract": abstract,
                    "isbn": isbn,
                    "url": url,
                    # "label": label,
                    # TODO: Handle conflict between Endnote label and ASReview label
                }
            )

        df = pd.DataFrame(dataset_list)
        df, _ = _standardize_dataframe(df)
        return df
