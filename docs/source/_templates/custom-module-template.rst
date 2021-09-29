{{ fullname | escape | underline}}

.. automodule:: {{ fullname }}

   {% block attributes %}
   {% if attributes %}
   .. rubric:: Module attributes

   .. autosummary::
      :toctree:
   {% for item in attributes %}
      {{ item }}
   {%- endfor %}
   {% endif %}
   {% endblock %}

   {% block functions %}
   {% if functions is defined and functions|length > 0 %}
   .. rubric:: {{ _("Functions") }}

   .. autosummary::
      :toctree:
      :nosignatures:
   {% for item in functions %}
      {% if item|length > 1 %}
         {{ item }}
      {% endif %}
   {%- endfor %}
   {% endif %}
   {% endblock %}

   {% block classes %}
   {% if classes is defined and classes|length > 0 %}
   .. rubric:: {{ _("Classes") }}

   .. autosummary::
      :toctree:
      :template: custom-class-template.rst
      :nosignatures:
   {% for item in classes %}
      {% if item|length > 1 %}
         {{ item }}
      {% endif %}
   {%- endfor %}
   {% endif %}
   {% endblock %}


{% block modules %}
{% if modules %}
.. autosummary::
   :toctree:
   :template: custom-module-template.rst
   :recursive:
{% for item in modules %}
   {{ item }}
{%- endfor %}
{% endif %}
{% endblock %}