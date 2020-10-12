from asreview.entry_points.base import BaseEntryPoint
from asreview.balance_strategies import list_balance_strategies
from asreview.models import list_classifiers
from asreview.feature_extraction import list_feature_extraction
from asreview.query_strategies import list_query_strategies


def _format_algorithm(values, name, description):

    s = f"  {name: <20}{description}"
    s += f" Available {name}:\n\n"

    result = []

    for x in values:
        result.append(" " * 22 + f"{x}")

    s += "\n".join(result)
    s += "\n\n"

    return s


class AlgorithmsEntryPoint(BaseEntryPoint):
    description = "Available active learning algorithms for ASReview."

    def execute(self, argv):

        s = "Available algorithms for ASReview. \n\n"

        # classifiers
        s += _format_algorithm(
            values=list_classifiers(),
            name="classifiers",
            description="Classification algorithms for ASReview."
        )

        # query_strategies
        s += _format_algorithm(
            values=list_query_strategies(),
            name="query_strategies",
            description="Query strategies for ASReview."
        )

        # balance_strategies
        s += _format_algorithm(
            values=list_balance_strategies(),
            name="balance_strategies",
            description="Balance strategies for ASReview."
        )

        # feature_extraction
        s += _format_algorithm(
            values=list_feature_extraction(),
            name="feature_extraction",
            description="Feature extraction algorithms for ASReview."
        )

        print(s)
