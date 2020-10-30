from asreview.entry_points.base import BaseEntryPoint
from asreview.models.balance import list_balance_strategies
from asreview.models import list_classifiers
from asreview.models.feature_extraction import list_feature_extraction
from asreview.models.query import list_query_strategies


def _format_algorithm(values, name, description):

    s = f"  {name: <20}Available {description}:\n\n"

    result = []

    for x in values:
        result.append(" " * 22 + f"{x}")

    s += "\n".join(result)
    s += "\n\n"

    return s


class AlgorithmsEntryPoint(BaseEntryPoint):
    description = "Available active learning algorithms for ASReview."

    def execute(self, argv):

        s = "Available active learning algorithms for ASReview. \n\n"

        # classifiers
        s += _format_algorithm(
            values=list_classifiers(),
            name="classifiers",
            description="classification algorithms"
        )

        # query_strategies
        s += _format_algorithm(
            values=list_query_strategies(),
            name="query_strategies",
            description="query strategies"
        )

        # balance_strategies
        s += _format_algorithm(
            values=list_balance_strategies(),
            name="balance_strategies",
            description="balance strategies"
        )

        # feature_extraction
        s += _format_algorithm(
            values=list_feature_extraction(),
            name="feature_extraction",
            description="feature extraction algorithms"
        )

        print(s)
