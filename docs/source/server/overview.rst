ASReview LAB Server
===================

ASReview LAB Server is a self-hosted, secure version of ASReview LAB that
enables users to screen together in the same project. It is designed with
organizations and multi-user situations in mind but can also be used by
individuals who want to use ASReview LAB without installing it on their own
computer.

The self-hosted ASReview LAB Server is especially useful for:

- **Organizations**: Organizations can use ASReview LAB Server to give access to
  ASReview LAB to their employees. This can be useful for organizations that
  make extensive use of ASReview LAB or other applications of screening
  prioritization.

- **Multi-user screening**: ASReview LAB Server is designed for multi-user
  situations. This means that multiple users can screen the same set of records
  at the same time. All users interact with the same AI model and the same set
  of records.

- **Data privacy**: ASReview LAB Server is self-hosted, which means that
  organizations can deploy it on their own hardware or in the cloud. This
  ensures that data is kept private and secure, and that organizations can
  comply with institutional policies.

- **Heavy models**: ASReview LAB Server is designed to separate the AI engine
  (Task server) from the front end and back end. This implies that the AI engine
  can be run on a separate server, which can be more powerful than the front-end
  and back-end servers. This is especially useful for organizations that have
  heavy models that require a lot of processing power or even GPUs.

- **Mobile screening**: ASReview LAB Server enables users to screen on mobile
  devices. This can lead to increased productivity and efficiency, as users can
  screen records on the go.

It facilitates users who want to use ASReview LAB without the need to install it
on their own computer. The web application can be accessed from any device with
a web browser and can be used on desktops, laptops, tablets, and mobile devices.
ASReview LAB Server enables users to create an account or connect via their
GitHub, ORCID, or Google accounts.

To streamline self-hosting and enterprise-level deployments, the ASReview Server
Stack provides a production-ready Docker Compose setup. Follow the installation
instructions in the :doc:`installation` section to get started. See the
:doc:`configuration` details for more information on how to configure your
ASReview LAB on your server.
