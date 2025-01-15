{{ fullname | escape | underline}}

.. currentmodule:: {{ module }}

.. autoclass:: {{ objname }}
    :show-inheritance:
    :members:
    :inherited-members:
    :special-members: __init__, __call__
    :undoc-members:
    :exclude-members: __weakref__

    {% block methods %}
    {% if methods %}
    .. rubric:: {{ _('Methods') }}

    .. autosummary::
    {% for item in methods %}
        ~{{ name }}.{{ item }}
    {%- endfor %}
    {% endif %}
    {% endblock %}

    {% block attributes %}
    {% if attributes %}
    .. rubric:: {{ _('Attributes') }}

    .. autosummary::
    {% for item in attributes %}
        ~{{ name }}.{{ item }}
    {%- endfor %}
    {% endif %}
    {% endblock %}
