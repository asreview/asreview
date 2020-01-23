from abc import ABC, abstractclassmethod


class BaseEntryPoint(ABC):
    description = "Base Entry point."

    @abstractclassmethod
    def execute(self, argv):
        raise NotImplementedError
