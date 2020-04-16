import pandas as pd
import xml.etree.ElementTree as ET
from asreview.io.utils import standardize_dataframe


def read_pubmed_xml(fp):
    """PubMed XML file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the XML file (.xml).

    Returns
    -------
    list:
        List with entries.
    """
    tree = ET.parse(fp)
    root = tree.getroot()

    records = []
    for child in root:
        parts = []
        elem = child.find('MedlineCitation/Article/ArticleTitle')
        title = elem.text.replace('[', '').replace(']', '')

        for elem in child.iter('AbstractText'):
            parts.append(elem.text)
        authors = []
        for author in child.iter('Author'):
            author_elems = []
            for elem in author.iter('ForeName'):
                author_elems.append(elem.text)
            for elem in author.iter('LastName'):
                author_elems.append(elem.text)
            authors.append(" ".join(author_elems))

        author_str = ", ".join(authors)
        abstract = " ".join(parts)

        keyword_list = [keyword.text for keyword in child.iter('Keyword')]
        keywords = ", ".join(keyword_list)

        new_record = {
            "abstract": abstract,
            "title": title,
            "authors": author_str,
            "keywords": keywords,
        }
        records.append(new_record)
    return standardize_dataframe(pd.DataFrame(records))
