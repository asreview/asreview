#!/usr/bin/env python3


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


ASCII_MSG_ORACLE = """
---------------------------------------------------------------------------------
|                                                                               |
| Welcome to the ASReview Automated Systematic Review software.                 |
| In this mode the computer will assist you in creating your systematic review. |
| After giving it a few papers that are either included or excluded,            |
| it will compute a model and show progressively more relevant papers.          |
| You can stop the review at any time by typing "S"                             |
| or by pressing Ctrl + C or for mac users Cmd + C.                             |
| Your progress will be saved.                                                  |
|                                                                               |
---------------------------------------------------------------------------------
"""

ASCII_MSG_SIMULATE = """
---------------------------------------------------------------------------------
|                                                                               |
| Welcome to the ASReview Automated Systematic Review software.                 |
| In this mode the computer will simulate how well the ASReview software        |
| could have accelerate the systematic review of your dataset.                  |
| You can sit back and relax while the computer runs this simulation.           |
---------------------------------------------------------------------------------
"""


def welcome_message(mode="oracle"):
    if mode == "oracle":
        return ASCII_LOGO + ASCII_MSG_ORACLE
    elif mode == "simulate":
        return ASCII_LOGO + ASCII_MSG_SIMULATE
