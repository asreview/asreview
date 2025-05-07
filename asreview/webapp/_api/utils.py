import ast
import inspect
import json
from pathlib import Path

from asreview import extensions


def read_tags_data(project):
    """Read tags data from the tags.json file."""
    tags_path = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "tags.json",
    )
    try:
        with open(tags_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except Exception as err:
        raise RuntimeError(f"Failed to read tags data: {err}")


def add_id_to_tags(group):
    if "values" not in group:
        return group

    for i, _ in enumerate(group["values"]):
        if "id" in group["values"][i]:
            continue

        group["values"][i]["id"] = i

    return group


def get_all_model_components():
    model_components = {
        "balancer": [],
        "classifier": [],
        "feature_extractor": [],
        "querier": [],
    }

    entry_points_per_submodel = [
        extensions("models.balancers"),
        extensions("models.classifiers"),
        extensions("models.feature_extractors"),
        extensions("models.queriers"),
    ]

    for entry_points, key in zip(entry_points_per_submodel, model_components.keys()):
        for e in entry_points:
            module = __import__(e.module, fromlist=[""])
            source_file = inspect.getfile(module)
            with open(source_file, "r") as f:
                source_code = f.read()
            tree = ast.parse(source_code)
            name = None
            label = None

            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    for class_node in node.body:
                        if isinstance(class_node, ast.Assign):
                            for target in class_node.targets:
                                if (
                                    isinstance(target, ast.Name)
                                    and target.id == "name"
                                    and isinstance(class_node.value, ast.Constant)
                                ):
                                    name = class_node.value.value
                                if (
                                    isinstance(target, ast.Name)
                                    and target.id == "label"
                                    and isinstance(class_node.value, ast.Constant)
                                ):
                                    label = class_node.value.value
                    if name == e.name:
                        break

            model_components[key].append({"name": e.name, "label": label or e.name})

    return model_components
