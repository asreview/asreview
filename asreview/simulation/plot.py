import matplotlib.pyplot as plt
import numpy as np

from asreview.simulation.analysis import Analysis


def _add_WSS(WSS, analysis, ax, col, result_format, box_dist=0.5):
    if WSS is None:
        return

    text = f"WSS@{WSS}%"
    _, WSS_x, WSS_y = analysis.WSS(WSS, x_format=result_format)
    if WSS_x is None or WSS_y is None:
        return

    text_pos_x = WSS_x[0] + box_dist
    text_pos_y = (WSS_y[0] + WSS_y[1])/2
    plt.plot(WSS_x, WSS_y, color=col)
    bbox = dict(boxstyle='round', facecolor=col, alpha=0.5)
    ax.text(text_pos_x, text_pos_y, text, color="white", bbox=bbox)


def _add_RRF(RRF, analysis, ax, col, result_format, box_dist=0.5):
    if RRF is None:
        return

    text = f"RRF@{RRF}%"
    _, RRF_x, RRF_y = analysis.RRF(RRF, x_format=result_format)
    if RRF_x is None or RRF_y is None:
        return

    text_pos_x = RRF_x[0] + box_dist
    text_pos_y = (RRF_y[0] + RRF_y[1])/2
    plt.plot(RRF_x, RRF_y, color=col)
    bbox = dict(boxstyle='round', facecolor=col, alpha=0.5)
    ax.text(text_pos_x, text_pos_y, text, color="white", bbox=bbox)


class Plot():
    def __init__(self, data_dirs):
        self.analyses = {}

        for data_dir in data_dirs:
            new_analysis = Analysis.from_dir(data_dir)
            if new_analysis is not None:
                data_key = new_analysis.key
                self.analyses[data_key] = new_analysis

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        for analysis in self.analyses.values():
            analysis.close()

    @classmethod
    def from_dirs(cls, data_dirs):
        plot_inst = Plot(data_dirs)
        if len(plot_inst.analyses) == 0:
            return None
        return plot_inst

    def plot_time_to_discovery(self):
        avg_times = []
        for analysis in self.analyses.values():
            avg_times.append(list(analysis.avg_time_to_discovery().values()))
        plt.hist(avg_times, 30, histtype='bar', density=False,
                 label=self.analyses.keys())
        plt.legend()
        plt.show()

    def plot_inc_found(self, result_format="percentage", abstract_only=False):
        """
        Plot the number of queries that turned out to be included
        in the final review.
        """
        legend_name = []
        legend_plt = []

        _, ax = plt.subplots()

        for i, data_key in enumerate(self.analyses):
            analysis = self.analyses[data_key]

            inc_found = analysis.inclusions_found(result_format=result_format)
            if result_format == "percentage":
                box_dist = 0.5
            else:
                box_dist = 20
            col = "C"+str(i % 10)
            _add_WSS(95, analysis, ax, col, result_format, box_dist)
            _add_WSS(100, analysis, ax, col, result_format, box_dist)
            _add_RRF(10, analysis, ax, col, result_format, box_dist)

            myplot = plt.errorbar(*inc_found, color=col)
            legend_name.append(f"{data_key}")
            legend_plt.append(myplot)

            if abstract_only:
                inc_found_final = analysis.inclusions_found(
                    result_format=result_format, final_labels=True)
                prev_value = 0
                x_vals = []
                y_vals = []
                for i in range(len(inc_found_final[0])):
                    if inc_found_final[1][i] != prev_value:
                        x_vals.append(inc_found_final[0][i])
                        y_vals.append(inc_found[1][i])
                        prev_value = inc_found_final[1][i]
#                 print(inc_found_final[0])
                myplot = plt.scatter(x_vals, y_vals, color="red")
#                 legend_name.append(f"{data_key} (final)")
                legend_plt.append(myplot)

        plt.legend(legend_plt, legend_name, loc="lower right")

        if result_format == "number":
            symb = "#"
        elif result_format == "percentage":
            symb = "%"
        else:
            symb = "?"

        plt.xlabel(f"{symb} Reviewed")
        plt.ylabel(f"< {symb} Inclusions found >")
        plt.title("Average number of inclusions found")
        plt.grid()
        plt.show()

    def plot_limits(self, prob_allow_miss=[0.1, 0.5, 2.0]):
        legend_plt = []
        legend_name = []
        linestyles = ['-', '--', '-.', ':']

        for i, data_key in enumerate(self.analyses):
            res = self.analyses[data_key].limits(
                prob_allow_miss=prob_allow_miss)
            x_range = res["x_range"]
            col = "C"+str(i % 10)

            for i_limit, limit in enumerate(res["limits"]):
                ls = linestyles[i_limit % len(linestyles)]
                my_plot, = plt.plot(x_range, np.array(limit)+np.array(x_range),
                                    color=col, ls=ls)
                if i_limit == 0:
                    legend_plt.append(my_plot)
                    legend_name.append(f"{data_key}")

        plt.plot(x_range, x_range, color="black", ls='--')
        plt.legend(legend_plt, legend_name, loc="upper right")
        plt.title("Articles left to read.")
        plt.grid()
        plt.show()
