# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# based on https://github.com/pypa/sampleproject - MIT License

# Always prefer setuptools over distutils
import platform
import subprocess
from pathlib import Path

from setuptools import Command
from setuptools import setup


class CompileAssets(Command):
    """
    Compile and build the frontend assets using npm and webpack.

    Registered as cmdclass in setup() so it can be called with
    ``python setup.py compile_assets``.
    """

    description = "Compile and build the frontend assets"
    user_options = []

    def initialize_options(self):
        """Set default values for options."""

    def finalize_options(self):
        """Set final values for options."""

    def run(self):
        """Run a command to compile and build assets."""

        path_webapp = Path(__file__).parent / "asreview" / "webapp"

        subprocess.check_call(
            ["npm", "install"],
            cwd=str(path_webapp),
            shell=(platform.system() == "Windows"),
        )
        subprocess.check_call(
            ["npm", "run-script", "build"],
            cwd=str(path_webapp),
            shell=(platform.system() == "Windows"),
        )


def get_cmdclass():
    cmdclass = {}
    cmdclass["compile_assets"] = CompileAssets
    return cmdclass


setup(
    cmdclass=get_cmdclass(),
)
