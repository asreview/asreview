from abc import ABC, abstractclassmethod

from asreview import __version__

class BaseEntryPoint(ABC):
    """Base class for defining entry points."""
    
    description = "Base Entry point."
    extension_name = "asreview"
    version = __version__

    @abstractclassmethod
    def execute(self, argv):
        """Perform the functionality of the entry point.

        Arguments
        ---------
        argv: list
            Argument list, with the entry point and program removed.
            For example, if `asreview plot X` is executed, then argv == ['X'].
        """
        raise NotImplementedError

    def format(self, entry_name="?"):
        """Create a short formatted description of the entry point.

        Arguments
        ---------
        entry_name: str
            Name of the entry point. For example 'plot' in `asreview plot X`
        """
        description = self.description
        version = getattr(self, "version", "?")
        extension_name = getattr(self, "extension_name", "?")

        display_name = f"{entry_name} [{extension_name}-{version}]"

        return f"{display_name}\n    {description}"
