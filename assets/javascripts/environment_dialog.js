var Redcaser = Redcaser || {}

Redcaser.EnvironmentDialog = (function () {
  'use strict'

  var self = function () {
    this.inputs = {}
    this.body   = this.build()
    this.modal  = this.modal()
  }

  var def = self.prototype

  // build :: -> DOM
  def.build = function () {
    this.inputs.name = DOMBuilder.textInput({classes: ['name-field']})

    return DOMBuilder.div({
      classes:  ['environment-dialog'],
      children: [
        DOMBuilder.div({
          classes:  ['environment-dialog-name'],
          children: [
            DOMBuilder.label({children: [DOMBuilder.text('Name')]}),
            this.inputs.name
          ]
        })
      ]
    })
  }

  def.modal = function () {
    var params = {
      autoOpen: false,
      height:   300,
      width:    350,
      modal:    true
    }

    return $(this.body).dialog(params)
  }

  // forCreate :: DOM
  def.forCreate = function (context) {
    this.context           = context
    this.inputs.name.value = ''

    this.modal.dialog('option', 'title', 'Create Environment')
    this.modal.dialog(
      'option',
      'buttons',
      [{
        class: 'environment-submit',
        text:  'OK',
        click: this.submitForCreate.bind(this)
      }]
    )
    this.modal.dialog('open')
  }

  // forUpdate :: DOM
  def.forUpdate = function (data, context) {
    this.context           = context
    this.inputs.name.value = data.environment.name

    this.modal.dialog('option', 'title', 'Update Environment')
    this.modal.dialog(
      'option',
      'buttons',
      [{
        class: 'environment-submit',
        text:  'OK',
        click: this.submitForUpdate.bind(this)
      }]
    )
    this.modal.dialog('open')
  }

  // submitForCreate :: Event
  def.submitForCreate = function (event) {
    var name = this.inputs.name.value
    var params = {
      data: {environment: {name: name}},
      done: function (response) {
        this.context.appendOption(response.environment)

        this.modal.dialog('close')
      }.bind(this),
      fail: function (response) { console.log(response) }
    }

    Redcaser.API.environments.create(params)
  }

  // submitForUpdate :: Event
  def.submitForUpdate = function (event) {
    var name = this.inputs.name.value
    var id   = this.context.inputs.select.value

    var params = {
      id:   id,
      data: {environment: {name: name}},
      done: function (response) {
        this.context.updateOption(response.environment)

        this.modal.dialog('close')
      }.bind(this),
      fail: function (response) { console.log(response) }
    }

    Redcaser.API.environments.update(params)
  }

  return self
})()
