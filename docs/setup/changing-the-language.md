# Changing the language

Material for MkDocs supports internationalization (i18n) and provides
translations for template variables and labels in 60+ languages. Additionally,
the site search can be configured to use a language-specific stemmer, if
available.

## Configuration

### Site language

<!-- md:version 1.12.0 -->
<!-- md:default `en` -->

You can set the site language in `mkdocs.yml` with:

``` yaml
theme:
  language: en # (1)!
```

1.  HTML5 only allows to set a [single language per document], which is why
    Material for MkDocs only supports setting a canonical language for the
    entire project, i.e. one per `mkdocs.yml`.

    The easiest way to build a multi-language documentation is to create one
    project in a subfolder per language, and then use the [language selector]
    to interlink those projects.

The following languages are supported:

<!-- hooks/translations.py -->

Note that some languages will produce unreadable anchor links due to the way
the default slug function works. Consider using a [Unicode-aware slug function].

!!! tip "Translations missing? Help us out, it takes only 5 minutes"

    Material for MkDocs relies on outside contributions for adding and updating
    translations for the more than 60 languages it supports. If your language
    shows that some translations are missing, click on the link to add them. If
    your language is not in the list, click here to [add a new language].

  [single language per document]: https://www.w3.org/International/questions/qa-html-language-declarations.en#attributes
  [language selector]: #site-language-selector
  [Unicode-aware slug function]: extensions/python-markdown.md#+toc.slugify
  [add a new language]: https://github.com/arshiacomplus/docs/issues/new?template=04-add-a-translation.yml&title=Add+translations+for+...

### Site language selector

<!-- md:version 7.0.0 -->
<!-- md:default none -->

If your documentation is available in multiple languages, a language selector
pointing to those languages can be added to the header. Alternate languages
can be defined via `mkdocs.yml`.

``` yaml
extra:
  alternate:
    - name: English
      link: /en/ # (1)!
      lang: en
    - name: Deutsch
      link: /de/
      lang: de
```

1.  Note that this must be an absolute link. If it includes a domain part, it's
    used as defined. Otherwise the domain part of the [`site_url`][site_url] as
    set in `mkdocs.yml` is prepended to the link.

The following properties are available for each alternate language:

<!-- md:option alternate.name -->

:   <!-- md:default none --> <!-- md:flag required -->
    This value of this property is used inside the language selector as the
    name of the language and must be set to a non-empty string.

<!-- md:option alternate.link -->

:   <!-- md:default none --> <!-- md:flag required -->
    This property must be set to an absolute link, which might also point to
    another domain or subdomain not necessarily generated with MkDocs.

<!-- md:option alternate.lang -->

:   <!-- md:default none --> <!-- md:flag required -->
    This property must contain an [ISO 639-1 language code] and is used for
    the `hreflang` attribute of the link, improving discoverability via search
    engines.

[![Language selector preview]][Language selector preview]

  [site_url]: https://www.mkdocs.org/user-guide/configuration/#site_url
  [ISO 639-1 language code]: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  [Language selector preview]: ../assets/screenshots/language-selection.png

#### Stay on page

<!-- md:sponsors -->
<!-- md:version insiders-4.47.0 -->
<!-- md:flag experimental -->

[Insiders] improves the user experience when switching between languages, e.g.,
if language `en` and `de` contain a page with the same path name, the user will
stay on the current page:

=== "Insiders"

    ```
    docs.example.com/en/     -> docs.example.com/de/
    docs.example.com/en/foo/ -> docs.example.com/de/foo/
    docs.example.com/en/bar/ -> docs.example.com/de/bar/
    ```

=== "Material for MkDocs"

    ```
    docs.example.com/en/     -> docs.example.com/de/
    docs.example.com/en/foo/ -> docs.example.com/de/
    docs.example.com/en/bar/ -> docs.example.com/de/
    ```

No configuration is necessary. We're working hard on improving multi-language
support in 2024, including making switching between languages even more seamless
in the future.

  [Insiders]: ../insiders/index.md

### Directionality

<!-- md:version 2.5.0 -->
<!-- md:default computed -->

While many languages are read `ltr` (left-to-right), Material for MkDocs also
supports `rtl` (right-to-left) directionality which is deduced from the
selected language, but can also be set with:

``` yaml
theme:
  direction: ltr
```

Click on a tile to change the directionality:

<div class="mdx-switch">
  <button data-md-dir="ltr"><code>ltr</code></button>
  <button data-md-dir="rtl"><code>rtl</code></button>
</div>

<script>
  var buttons = document.querySelectorAll("button[data-md-dir]")
  buttons.forEach(function(button) {
    button.addEventListener("click", function() {
      var attr = this.getAttribute("data-md-dir")
      document.body.dir = attr
      var name = document.querySelector("#__code_2 code span.l")
      name.textContent = attr
    })
  })
</script>

## Customization

### Custom translations

If you want to customize some of the translations for a language, just follow
the guide on [theme extension] and create a new partial in the `overrides`
folder. Then, import the [translations] of the language as a fallback and only
adjust the ones you want to override:

=== ":octicons-file-code-16: `overrides/partials/languages/custom.html`"

    ``` html
    <!-- Import translations for language and fallback -->
    {% import "partials/languages/de.html" as language %}
    {% import "partials/languages/en.html" as fallback %} <!-- (1)! -->

    <!-- Define custom translations -->
    {% macro override(key) %}{{ {
      "source.file.date.created": "Erstellt am", <!-- (2)! -->
      "source.file.date.updated": "Aktualisiert am"
    }[key] }}{% endmacro %}

    <!-- Re-export translations -->
    {% macro t(key) %}{{
      override(key) or language.t(key) or fallback.t(key)
    }}{% endmacro %}
    ```

    1.  Note that `en` must always be used as a fallback language, as it's the
        default theme language.

    2.  Check the [list of available languages], pick the translation you want
        to override for your language and add them here.

=== ":octicons-file-code-16: `mkdocs.yml`"

    ``` yaml
    theme:
      language: custom
    ```

  [theme extension]: ../customization.md#extending-the-theme
  [translations]: https://github.com/arshiacomplus/docs/blob/master/src/templates/partials/languages/
  [list of available languages]: https://github.com/arshiacomplus/docs/blob/master/src/templates/partials/languages/
