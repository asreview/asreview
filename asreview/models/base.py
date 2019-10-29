from abc import ABC, abstractmethod

from asreview.utils import _unsafe_dict_update


class BaseModel(ABC):
    """Base model, abstract class to be implemented by derived ones.

    All the non-abstract methods are okay if they are not implemented.
    All functions dealing with hyperparameters can be ignore if you don't
    use hyperopt for hyperparameter tuning.
    There is a distinction between model parameters, which are needed during
    model creation and fit parameters, which are used during the fitting
    process. Fit parameters can be distinct from fit_kwargs (which are passed
    to the fit function).
    """
    def __init__(self, param):
        self.name = "base"
        self.param = _unsafe_dict_update(self.default_param(), param)

    def fit_param(self):
        "Obtain fit parameters from parameters."
        fit_param = {x: self.param[x] for x in self.fit_param_names()}
        return fit_param

    def model_param(self):
        "Obtain model parameters from parameters."
        model_param = {x: self.param[x] for x in self.model_param_names()}
        return model_param

    def fit_kwargs(self):
        "Get fit arguments from fit parameters."
        return self.fit_param()

    @abstractmethod
    def model(self):
        raise NotImplementedError

    @abstractmethod
    def get_Xy(self):
        raise NotImplementedError

    def default_param(self):
        "Get default parameters"
        return {}

    def full_hyper_space(self):
        """Get a hyperparameter space to use with hyperopt.

        Returns
        -------
        dict:
            Parameter space.
        dict:
            Parameter choices; in case of hyperparameters with a list of
            choices, store the choices there.
        """
        return {}, {}

    def hyper_space(self, exclude=[], **kwargs):
        """Create a (partial) hyper parameters space.

        Arguments
        ---------
        exclude: list, str
            A list of hyperparameter to exclude from searching.
        kwargs:
            Set hyperparameters to constant values using the keyword arguments.

        Returns
        -------
        dict:
            Hyperparameter space.
        """
        from hyperopt import hp
        hyper_space, hyper_choices = self.full_hyper_space()

        for hyper_par in exclude:
            hyper_space.pop(self._full(hyper_par), None)
            hyper_choices.pop(self._full(hyper_par), None)

        for hyper_par in kwargs:
            full_hyper = self._full(hyper_par)
            hyper_val = kwargs[hyper_par]
            hyper_space[full_hyper] = hp.choice(full_hyper, [hyper_val])
            hyper_choices[full_hyper] = [hyper_val]
        return hyper_space, hyper_choices

    def _full(self, par):
        "Add 'mdl_' to parameter names."
        return "mdl_" + par

    def _small(self, par):
        "Remove 'mdl_' from parameter names."
        return par[4:]

    def model_param_names(self):
        "All model parameter names."
        return list(self.param.keys())

    def fit_param_names(self):
        "All fit parameter names."
        return []
