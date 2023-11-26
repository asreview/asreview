from asreview.utils import get_random_state


def test_automatic_seed():
    random_state = get_random_state()
    seed = random_state.seed
    assert isinstance(seed, int)
    new_random_state = get_random_state(seed)
    assert new_random_state.seed == seed


def test_integer_seed():
    random_state = get_random_state(42)
    assert random_state.seed == 42


def test_state_seed():
    random_state = get_random_state(42)
    assert random_state.seed == 42
    new_random_state = get_random_state(random_state)
    assert new_random_state.seed == 42
