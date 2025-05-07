import json
from pathlib import Path
from importlib.metadata import entry_points


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


def get_dist_extensions_metadata():
    """Get all distributions with models."""
    entries = entry_points(group="asreview.models", name="_metadata")

    all_metadata = {}

    for e in entries:
        try:
            metadata = e.load()

            if not isinstance(metadata, dict):
                raise TypeError(
                    f"Metadata for {e.name} is not a dictionary: {type(metadata)}"
                )

            for key, value in metadata.items():
                if key in all_metadata and isinstance(all_metadata[key], dict):
                    all_metadata[key].update(value)
                else:
                    all_metadata[key] = value

        except Exception:
            continue

    return all_metadata


def get_all_model_components():
    model_components = {
        "balancers": [],
        "classifiers": [],
        "feature_extractors": [],
        "queriers": [],
    }

    entry_points_per_submodel = [
        extensions("models.balancers"),
        extensions("models.classifiers"),
        extensions("models.feature_extractors"),
        extensions("models.queriers"),
    ]

    metadata = get_dist_extensions_metadata()

    for entries, key in zip(entry_points_per_submodel, model_components.keys()):
        for e in entries:
            try:
                label = metadata[key][e.name]["label"]
            except KeyError:
                label = e.name
            except Exception as err:
                raise Exception(f"Failed to read metadata: {err}")

            model_components[key].append(
                {
                    "name": e.name,
                    "label": label,
                }
            )

    return model_components
