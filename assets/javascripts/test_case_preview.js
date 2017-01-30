var Redcaser = Redcaser || {}

Redcaser.TestCasePreview = (function () {
  var self = {}

  var m = DOMBuilder

  // build :: Object -> DOM
  self.build = function (element, journals, relations, statuses) {
    this.journals = m.div({ classes: ['case-journals']})
    this.related_issues = m.div({ classes: ['case-related-issues']})

    var selectedId, testCaseStatusId

    if (element.status) {
      selectedId       = element.status.id
      testCaseStatusId = element.status.test_case_status_id
    }

    if (journals.length > 0) {
      this.buildJournals(journals)
    }

    if (relations.length > 0) {
      this.buildRelations(relations)
    }

    var node = m.div({
      classes:  ['case-preview', 'box'],
      children: [
        m.div({
          classes:  ['case-header'],
          children: [
            m.span({
              children: [
                m.text("#" + element.issue_id + ": " + element.subject)
              ]
            }
          )]
        }),
        m.div({
          classes:  ['case-body'],
          children: [
            m.div({
              classes:  ['attributes']
            }),
            m.div({
              classes:  ['case-preconditions'],
              children: [
                m.p({
                  classes:  ['section'],
                  children: [m.text('Preconditions:')]
                }),
                m.div({
                    classes:    ['wiki'],
                    insertHTML: ['afterbegin', element.preconditions]
                })
              ]
            }),
            m.div({
              classes:  ['case-steps'],
              children: [
                m.p({
                  classes:  ['section'],
                  children: [m.text('Steps:')]
                }),
                m.div({
                    classes:    ['wiki'],
                    insertHTML: ['afterbegin', element.steps]
                })
              ]
            }),
            m.div({
              classes:  ['case-expected'],
              children: [
                m.p({
                  classes:  ['section'],
                  children: [m.text('Expected result:')]
                }),
                m.div({
                    classes:    ['wiki'],
                    insertHTML: ['afterbegin', element.expected_results]
                })
              ]
            })
          ]
        }),
        m.div({
          classes:  ['case-footer'],
          children: [
            m.div({
              classes: ['tabs'],
              children: [
                m.ul ({
                  classes: [],
                  children: [
                    m.li ({
                      children: [
                        m.link({
                          classes:  ['selected','execution-tab'],
                          href:     '#',
                          dataset:  { tab: "results" },
                          children: [m.text('Results & History')]
                        })
                      ]
                    }),
                    m.li ({
                      children: [
                        m.link({
                          href:     '#',
                          classes:  ['execution-tab'],
                          dataset:  { tab: "related" },
                          children: [m.text('Related Issues')]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            m.div({
              classes: ['tab-results', 'tab-content'],
              children: [
                this.journals,
                m.textarea({classes: ['case-footer-comment']}),
                m.select({
                  classes: element.status ? ['case-footer-select', element.status.name.split(" ").join("_").toLowerCase()] : ['case-footer-select'],
                  children: m.options({
                    blankOption:  m.option({value: ' ', children: [m.text('Not run')]}),
                    data:         statuses,
                    includeBlank: element.status ? false : true,
                    selected:     selectedId,
                    valueField:   'id',
                    textField:    'name'
                  })
                }),
                m.button({
                  classes: ['case-footer-submit'],
                  dataset: {
                    id:                  element.id,
                    test_case_status_id: testCaseStatusId
                  },
                  children: [m.text('Submit')]
                })
              ]
            }),
            m.div({
              classes: ['tab-related', 'hidden', 'tab-content'],
              children: [this.related_issues]
            })
          ]
        }),
      ]
    })

    var relatedNode = m.div({
      children: [
        m.select({
          classes:  ['case-footer-related-select'],
          children: m.options({
            data:   [
              {value: 'relates', text: 'Related to'},
              {value: 'blocked', text: 'Blocks'}
            ],
            includeBlank: true
          })
        }),
        m.button({
          classes:  ['case-footer-related-submit'],
          dataset:  {
            id:                  element.id,
            test_case_status_id: testCaseStatusId
          },
          children: [m.text('Create related issue')]
        })
      ]
    })

    if (element.status) {
      node.getElementsByClassName("tab-results")[0].appendChild(relatedNode)
    }

    return node
  }

  self.buildJournals = function (journals) {
    journals.forEach(function(journal){

      var node = m.div({
        classes:  ['journal-' + journal.journal.id ],
        children: [
          m.h4({
            insertHTML: ['afterbegin', journal.avatar + " " + journal.author]
          }),
          m.ul({
            classes: ['details'],
            children: [self.buildJournalDetail(journal.journal.result_id)],
          }),
          m.div({
            classes:  ['wiki'],
            insertHTML: ['afterbegin', journal.journal.comment]
          })
        ]
      })

      self.journals.appendChild(node)
    })
  }

  self.buildJournalDetail = function(status) {
    var li = m.li({
              children: [
                m.strong({
                  children: [m.text('Status')]
                }),
                m.text(' changed to '),
                m.span({
                  classes: ['status'],
                  children: [m.text(status)]
                }),
              ]
            })
    return li
  }

  self.buildRelations = function (relations) {
    relations.forEach(function(relation){
      console.log(relation)

      var node = m.div({
        classes:  ['related-issue'],
        children: [
          m.div({
            insertHTML: ['afterbegin', relation]
          })
        ]
      })

      self.related_issues.appendChild(node)
    })
  }

  return self
})();
