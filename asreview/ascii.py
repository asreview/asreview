# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

from asreview.config import EMAIL_ADDRESS
from asreview.config import GITHUB_PAGE


ASCII_TEA = """
                (  )   (   )  )
                 ) (   )  (  (
                 ( )  (    ) )
                 _____________
                <_____________> ___
                |             |/ _ \ 
                |               | | |
                |               |_| |
             ___|             |\___/
            /    \___________/    \ 
            \_____________________/
"""

ASCII_LOGO = """
            _____ _____            _
     /\    / ____|  __ \          (_)
    /  \  | (___ | |__) |_____   ___  _____      __
   / /\ \  \___ \|  _  // _ \ \ / / |/ _ \ \ /\ / /
  / ____ \ ____) | | \ \  __/\ V /| |  __/\ V  V /
 /_/    \_\_____/|_|  \_\___| \_/ |_|\___| \_/\_/
"""


ASCII_MSG_SIMULATE = """
---------------------------------------------------------------------------------
|                                                                                |
|  Welcome to the ASReview Automated Systematic Review software.                 |
|  In this mode the computer will simulate how well the ASReview software        |
|  could have accelerate the systematic review of your dataset.                  |
|  You can sit back and relax while the computer runs this simulation.           |
|                                                                                |
|  GitHub page:        {0: <58}|
|  Questions/remarks:  {1: <58}|
|                                                                                |
---------------------------------------------------------------------------------
""".format(GITHUB_PAGE, EMAIL_ADDRESS)


def welcome_message():
    return ASCII_LOGO + ASCII_MSG_SIMULATE
