from asreview.webapp.utils.paths import asreview_path


def is_project(project_id):

    project_path = asreview_path() / project_id / "project.json"

    return project_path.exists()
