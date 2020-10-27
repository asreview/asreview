# from asreview.dataset import ASReviewData
from asreview.webapp.utils.paths import get_project_path


def check_dataset(fp):

    # try:
    #     ASReviewData.from_file(fp)
    # except Exception as err:
    #     raise Exception("Incorrect file format")
    pass


def is_project(project_id):

    if get_project_path(project_id).exists():
        return True

    return False
