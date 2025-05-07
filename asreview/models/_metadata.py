MODEL_METADATA = {
    "balancers": {
        "balanced": {
            "label": "Balanced Sample Weight",
        },
    },
    "classifiers": {
        "rf": {
            "label": "Random forest",
        },
        "logistic": {
            "label": "Logistic regression",
        },
        "svm": {
            "label": "Support vector machine",
        },
        "nb": {
            "label": "Naive Bayes",
        },
    },
    "feature_extractors": {
        "tfidf": {
            "label": "TF-IDF",
        },
        "onehot": {
            "label": "OneHot",
        },
    },
    "queriers": {
        "random": {
            "label": "Random",
        },
        "uncertainty": {
            "label": "Uncertainty",
        },
        "max": {
            "label": "Maximum",
        },
        "max_uncertainty": {
            "label": "Mixed (95% Maximum and 5% Uncertainty)",
        },
        "max_random": {
            "label": "Mixed (95% Maximum and 5% Random)",
        },
        "top_down": {
            "label": "Top-down",
        },
    },
}
