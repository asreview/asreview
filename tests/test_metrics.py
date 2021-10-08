from asreview.metrics import rrf, wss, avg_time_to_discovery


def test_rrf():
    
    rrf([0,1,0,1,0,0,1,0,0,1]) == 0
    rrf([0,1,0,1,0,0,1,0,0,1], 0.10) == 0
    rrf([0,1,0,1,0,0,1,0,0,1], 0.20) == 1
    rrf([0,1,0,1,0,0,1,0,0,1], 0.50) == 1
    rrf([0,1,0,1,0,0,1,0,0,1], 1) == 4

def test_wss():

    wss([1,1,0,1,0,1,0,0,0,0])


def test_time_to_discovery():

    avg_time_to_discovery([1,1,0,1,0,1,0,0,0,0])