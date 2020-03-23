from pathlib import Path

from pytest import mark

from asreview import ASReviewData


@mark.parametrize(
    "keywords,paper_id",
    [
        ("bronchogenic duplication cyst", 0),
        ("diagnositc accuracy microscopy female priority", 1),
        ("immunophenotiping", 4),
        ("Foregut report embryoogenesis", 4),
        ("Liu Adler", 0),
        ("Khoury cysts", 4),
        ("Isolated Edwards", 5),
        ("Kwintanilla-djeck Neck", 3),
        ("Cancer case computer contrast pancreatomy Yamada", 2),
    ])
def test_fuzzy_finder(keywords, paper_id):
    fp = Path("test", "demo_data", "embase.csv")
    as_data = ASReviewData.from_file(fp)

    assert as_data.fuzzy_find(keywords)[0] == paper_id
