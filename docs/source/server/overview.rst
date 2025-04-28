ASReview LAB Server
===================

ASReview LAB Server is a self-hosted, secure version of ASReview LAB. It is
designed for facilitate users who want to use ASReview LAB but without the need
to install it on their own computer. The web application that can be accessed
from any device with a web browser and can be used on desktops, laptops,
tablets, and mobile devices. ASReview LAB Server enables users to create an
account or connect via their GitHub, ORCID, or Google accounts.

See the :doc:`configuration` details for more
information on how to configure your ASReview LAB on your server.


* **Server Stack**

    - To streamline self-hosting and enterprise-level deployments, the ASReview
      Server Stack provides a production-ready Docker Compose set-up, available
      on GitHub at `asreview-server-stack`. This configuration packages the main
      components of ASReview—such as the AI engine (model server), the React
      front-end, and a database layer—into separate, containerized services. As
      a result, organizations can run ASReview on their own hardware or in a
      cloud environment, ensuring data privacy and compliance with institutional
      policies.


Features
--------

ASReview LAB provides two options for creating an account: by connecting with
your GitHub, ORCID, or Google account, or by creating an account. All
information is stored securely on the ASReview LAB server and fully self-hosted.

Log in with GitHub, ORCID, or Google
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB Server provides a easy way to log in with your GitHub, ORCID, or
Google account.

.. figure:: ../../images/server_signin.png
	:alt: Sign in with GitHub, ORCID, or Google account

See the :doc:`configuration` details for more
information on how to configure your ASReview on your server to enable this
feature.

Create account
~~~~~~~~~~~~~~

ASReview LAB Server provides a easy way to create an account with your email.

.. figure:: ../../images/server_email.png
   :alt: Create account with account and password
