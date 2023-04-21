from asreview.utils import SeededRandomState


def test_automatic_seed():
    random_state = SeededRandomState()
    seed = random_state.random_seed
    assert isinstance(seed, int)
    new_random_state = SeededRandomState(seed)
    assert new_random_state.random_seed == seed


def test_integer_seed():
    random_state = SeededRandomState(42)
    assert random_state.random_seed == 42


def test_state_seed():
    random_state = SeededRandomState(42)
    assert random_state.random_seed == 42
    new_random_state = SeededRandomState(random_state)
    assert new_random_state.random_seed == 42
