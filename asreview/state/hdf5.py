from asreview.state.base import BaseState


class HDF5State(BaseState):
    @classmethod
    def from_file(cls, *args, **kwargs):
        from asreview.state.hdf5_v1 import HDF5v1State
        from asreview.state.hdf5_v2 import HDF5v2State

        state = HDF5v2State(*args, **kwargs)
        if state.file_version[0] == "2":
            return state

        state.close()
        return HDF5v1State(*args, **kwargs)
