# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# the schema describes the content of the ASReview project file.

SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "title": "The ASReview project file root schema",
    "description": "The root schema comprises the entire project.json file in the ASReview project file.",
    "default": {},
    "examples": [
        {
            "version": "1.0",
            "id": "example",
            "mode": "oracle",
            "name": "example",
            "description": "",
            "authors": "",
            "created_at_unix": 1648205610,
            "reviews": [
                {
                    "id": "4793de70a8d44eb4baa68bac2853c91a",
                    "status": "review",
                }
            ],
            "feature_matrices": [
                {"id": "tfidf", "filename": "tfidf_feature_matrix.npz"}
            ],
            "dataset_path": "example.ris",
        }
    ],
    "required": ["version", "id", "mode", "name"],
    "properties": {
        "version": {
            "$id": "#/properties/version",
            "type": "string",
            "title": "The version schema",
            "description": "The version of ASReview on initiation of the project.",
            "default": "",
            "examples": ["1.0"],
        },
        "id": {
            "$id": "#/properties/id",
            "type": "string",
            "title": "The id schema",
            "description": "The unique identifier of the project.",
            "default": "",
            "examples": ["example"],
        },
        "mode": {
            "$id": "#/properties/mode",
            "type": "string",
            "title": "The mode schema",
            "description": "The mode of the project. One of oracle or simulate.",
            "default": "oracle",
            "enum": ["oracle", "simulate"],
            "examples": ["oracle"],
        },
        "name": {
            "$id": "#/properties/name",
            "type": ["string", "null"],
            "title": "The name schema",
            "description": "The name of the project.",
            "default": "",
            "examples": ["example"],
        },
        "description": {
            "$id": "#/properties/description",
            "type": ["string", "null"],
            "title": "The description schema",
            "description": "The description of the project.",
            "default": "",
            "examples": [""],
        },
        "authors": {
            "$id": "#/properties/authors",
            "type": ["string", "null"],
            "title": "The authors schema",
            "description": "The authors of the project.",
            "default": "",
            "examples": [""],
        },
        "created_at_unix": {
            "$id": "#/properties/created_at_unix",
            "type": ["integer", "null"],
            "title": "The created_at_unix schema",
            "description": "An explanation about the purpose of this instance.",
            "default": 0,
            "examples": [1648205610],
        },
        "reviews": {
            "$id": "#/properties/reviews",
            "type": "array",
            "title": "The reviews schema",
            "description": "The list of reviews in the project. Multiple reviews per project are possible, however this is limited to 1 at the moment.",
            "default": [],
            "examples": [
                [
                    {
                        "id": "4793de70a8d44eb4baa68bac2853c91a",
                        "status": "review",
                    }
                ]
            ],
            "additionalItems": True,
            "items": {
                "$id": "#/properties/reviews/items",
                "anyOf": [
                    {
                        "$id": "#/properties/reviews/items/anyOf/0",
                        "type": "object",
                        "title": "The first anyOf schema",
                        "description": "An explanation about the purpose of this instance.",
                        "default": {},
                        "examples": [
                            {
                                "id": "4793de70a8d44eb4baa68bac2853c91a",
                                "status": "review",
                            }
                        ],
                        "required": ["id", "status"],
                        "properties": {
                            "id": {
                                "$id": "#/properties/reviews/items/anyOf/0/properties/id",
                                "type": "string",
                                "title": "The id of the review.",
                                "description": "A unique UUID4 identifier of the review.",
                                "default": "",
                                "examples": ["4793de70a8d44eb4baa68bac2853c91a"],
                            },
                            "status": {
                                "$id": "#/properties/reviews/items/anyOf/0/properties/status",
                                "type": ["string", "null"],
                                "title": "The status of the review.",
                                "description": "The status of the review. Options are setup, review, finished.",
                                "enum": ["setup", "review", "finished"],
                                "default": "setup",
                                "examples": ["review"],
                            },
                        },
                        "additionalProperties": False,
                    }
                ],
            },
        },
        "feature_matrices": {
            "$id": "#/properties/feature_matrices",
            "type": "array",
            "title": "The feature_matrices schema",
            "description": "Information about the feature matrices.",
            "default": [],
            "examples": [[{"id": "tfidf", "filename": "tfidf_feature_matrix.npz"}]],
            "additionalItems": True,
            "items": {
                "$id": "#/properties/feature_matrices/items",
                "anyOf": [
                    {
                        "$id": "#/properties/feature_matrices/items/anyOf/0",
                        "type": "object",
                        "title": "The first anyOf schema",
                        "description": "Information about a feature matrix.",
                        "default": {},
                        "examples": [
                            {"id": "tfidf", "filename": "tfidf_feature_matrix.npz"}
                        ],
                        "required": ["id", "filename"],
                        "properties": {
                            "id": {
                                "$id": "#/properties/feature_matrices/items/anyOf/0/properties/id",
                                "type": "string",
                                "title": "The id schema",
                                "description": "A unique id of the feature matrix.",
                                "default": "",
                                "examples": ["tfidf"],
                            },
                            "filename": {
                                "$id": "#/properties/feature_matrices/items/anyOf/0/properties/filename",
                                "type": "string",
                                "title": "The filename schema",
                                "description": "The name of the file with the feature matrix. Usually a sparse matrix.",
                                "default": "",
                                "examples": ["tfidf_feature_matrix.npz"],
                            },
                        },
                        "additionalProperties": True,
                    }
                ],
            },
        },
        "datasets": {
            "$id": "#/properties/datasets",
            "type": "array",
            "title": "The datasets schema",
            "description": "The list of datasets in the project.",
            "default": [],
            "additionalItems": False,
            "items": {
                "$id": "#/properties/datasets/items",
                "anyOf": [
                    {
                        "$id": "#/properties/datasets/items/anyOf/0",
                        "type": "object",
                        "title": "The first anyOf schema",
                        "description": "An explanation about the purpose of this instance.",
                        "required": ["id", "name"],
                        "properties": {
                            "id": {
                                "$id": "#/properties/datasets/items/anyOf/0/properties/id",
                                "type": "string",
                                "title": "The id of the dataset.",
                                "description": "A unique UUID4 identifier of the dataset.",
                                "default": "",
                                "examples": ["4793de70a8d44eb4baa68bac2853c91a"],
                            },
                            "name": {
                                "$id": "#/properties/datasets/items/anyOf/0/properties/name",
                                "type": "string",
                                "title": "The filename of the dataset.",
                                "description": "The name of the dataset file.",
                                "default": "",
                                "examples": ["example.ris"],
                            },
                        },
                        "additionalProperties": False,
                        "examples": [
                            {
                                "id": "4793de70a8d44eb4baa68bac2853c91a",
                                "name": "example.ris",
                            }
                        ],
                    }
                ],
            },
            "examples": [
                [
                    {
                        "id": "4793de70a8d44eb4baa68bac2853c91a",
                        "name": "example.ris",
                    }
                ]
            ],
        },
    },
    "additionalProperties": True,
}
