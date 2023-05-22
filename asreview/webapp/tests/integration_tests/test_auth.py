import time

import pytest

from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options as FirefoxOptions


from selenium import webdriver

@pytest.fixture(scope="module")
def browser():
    service = Service('/Users/casperkaandorp/Desktop/geckodriver')
    options = FirefoxOptions()
    options.add_argument("--headless")
    b = webdriver.Firefox(service=service) #, options=options)
    yield b
    b.close()
    b.quit()


def test_example(client_auth, browser):

    browser.get('http://127.0.0.1:3000')
    time.sleep(4)


def test_foo(client_auth, browser):
    browser.get('http://127.0.0.1:3000/auth/login')
    time.sleep(4)


