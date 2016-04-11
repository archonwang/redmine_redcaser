var RedcaserTestSuiteTree = function () {

  self = this;

  this.tree = null;

  var caseItems;

  var specialSuiteItems;

  var suiteItems;

  var suiteItems;

  this.initialize = function () {
    prepareContextItems();
    build();
  };

  this.getSelectionType = function (tree) {
    var selectionType = -1;
    var selection = tree.get_selected(true);
    for (var i = 0; i < selection.length; i++) {
      if (selectionType !== 2) {
        if (selection[i].type === 'case') {
          if (selectionType === 1) {
            selectionType = 2;
          } else {
            selectionType = 0;
          }
        } else if (selection[i].type === 'suite') {
          if (selectionType === 0) {
            selectionType = 2;
          } else {
            selectionType = 1;
          }
        }
      }
      if ((selection[i].parents.length === 1) || (selection[i].text === '.Obsolete') || (selection[i].text === '.Unsorted')) {
        selectionType = (selection.length === 1) ? 3 : 4;
        break;
      }
    }
    return selectionType;
  };

  var checkCallback = function (
    operation,
    node,
    nodeParent,
    node_position,
    more
  ) {
    // Operation can be 'create_node', 'rename_node', 'delete_node',
    // 'move_node' or 'copy_node'.
    var isOK = true;
    if (operation === "copy_node") {
      if (more.ref !== undefined) {
        isOK = (this.get_node(node.parent) != nodeParent);
      }
    }
    return isOK;
  };

  var isDraggable = function (nodes) {
    // Make sure the user can't drag the root node, "default" nodes,
    // the "unsorted" node, and disabled nodes.
    for (var i = 0; i < nodes.length; i++) {
      if ((nodes[i].parents.length < 2) || (nodes[i].type === 'default') || (nodes[i].text === '.Unsorted') || (nodes[i].state.disabled === true)) {
        return false;
      }
    }
    return true;
  };

  var moveTestCase = function (
    newNode,
    orgNode,
    newInstance,
    oldInstance
  ) {
    newNode.original = orgNode.original;
    var apiParms = $.extend({},
      Redcaser.api.testCase.update(orgNode.original.issue_id), {
        params: {
          parent_id: newInstance
            .get_node(newNode.parent)
            .original
            .suite_id
        },
        success: function () {
          oldInstance.delete_node(orgNode);
        },
        error: function () {
          newInstance.delete_node(newNode);
        },
        errorMessage: (
          Redcaser.tracker_name + " '" + orgNode.text + "' can't be moved"
        )
      }
    );
    Redcaser.api.apiCall(apiParms);
  };

  var moveTestSuite = function (
    newNode,
    orgNode,
    newInstance,
    oldInstance
  ) {
    newNode.original = orgNode.original;
    var apiParms = $.extend({},
      Redcaser.api.testSuite.update(orgNode.original.suite_id), {
        params: {
          parent_id: newInstance
            .get_node(newNode.parent)
            .original
            .suite_id
        },
        success: function () {
          oldInstance.delete_node(orgNode);
        },
        error: function () {
          newInstance.delete_node(newNode);
        },
        errorMessage: (
          "Test suite '" + orgNode.text + "' can't be moved"
        )
      }
    );
    Redcaser.api.apiCall(apiParms);
  };

  var onCopy = function (event, object) {
    // Fields: is_foreign, is_multi, new_instance, node,old_instance,
    //         old_parent (ID), old_position (index), original (node),
    //         parent (id), position (index (altid 0?))
    // Internal drag + drop
    if (object.old_instance === object.new_instance) {
      switch (object.original.type) {
        case 'case':
          moveTestCase(
            object.node,
            object.original,
            object.new_instance,
            object.old_instance
          );
          break;
        case 'suite':
          moveTestSuite(
            object.node,
            object.original,
            object.new_instance,
            object.old_instance
          );
          break;
      }
    }
  };

  var contextCopyTo = function (params) {
    var node = self.tree.get_node(params.reference);
    var apiParms = $.extend({},
      Redcaser.api.testCase.copy(node.original.issue_id), {
        params: {
          dest_project: params.item.id
        },
        errorMessage: ("Can't copy '" + node.text + "'")
      }
    );
    Redcaser.api.apiCall(apiParms);
  };

  var prepareContextItems = function () {
    var tmpObj = {};
    var copyItems = {};
    for (var i = 0; i < Redcaser.jsCopyToMenuItems.length; i++) {
      tmpObj['keyfor_' + Redcaser.jsCopyToMenuItems[i].id] = {
        label: Redcaser.jsCopyToMenuItems[i].text,
        id: Redcaser.jsCopyToMenuItems[i].id,
        action: contextCopyTo
      };
      $.extend(copyItems, tmpObj);
    }
    caseItems = {
      viewCase: {
        label: 'View',
        action: viewCase
      },
      copyCase: {
        label: 'Copy to',
        submenu: copyItems
      }
    };
    specialSuiteItems = {
      addSuite: {
        label: 'Add suite',
        action: addSuite
      }
    };
    suiteItems = {
      renameSuite: {
        label: 'Rename',
        action: renameSuite
      }
    };
    commonItems = {
      deleteItem: {
        label: 'Delete',
        action: deleteItem
      }
    };
  };

  var deleteCase = function (node) {
    var apiParms = $.extend({},
      Redcaser.api.testCase.update(node.original.issue_id), {
        params: {
          obsolesce: true
        },
        success: function () {
          var org = $.extend({}, node.original);
          self.tree.delete_node(node);
          var newId = self.tree.create_node(
            self.tree.get_node('.Obsolete'),
            org
          );
        },
        errorMessage: (
          Redcaser.tracker_name + " '" + node.text + "' can't be deleted"
        )
      }
    );
    Redcaser.api.apiCall(apiParms);
  };

  var deleteSuite = function (node) {
    if ((node.parents.length > 1) && (node.text !== '.Unsorted') && (node.text !== '.Obsolete')) {
      var apiParms = $.extend({},
        Redcaser.api.testSuite.destroy(node.original.suite_id), {
          success: function () {
            self.tree.delete_node(node);
          },
          errorMessage: (
            "Execution suite '" + node.text + "' can't be deleted"
          )
        }
      );
      Redcaser.api.apiCall(apiParms);
    }
  };

  var deleteItem = function (params) {
    var selected = self.tree.get_selected(true);
    for (var i = 0; i < selected.length; i++) {
      if (selected[i].type === 'case') {
        deleteCase(selected[i]);
      } else {
        deleteSuite(selected[i]);
      }
    }
  };

  var addSuite = function (params) {
    var node = self.tree.get_node(params.reference);
    $('#redcase-dialog').dialog({
      title: 'New test suite name',
      modal: true,
      resizable: false,
      buttons: {
        OK: function () {
          var name = $('#redcase-dialog-value').val();
          var apiParms = $.extend({},
            Redcaser.api.testSuite.create(), {
              params: {
                name: name,
                parent_id: node.original.suite_id
              },
              success: function (newNode) {
                self.tree.create_node(node, newNode);
              },
              errorMessage: (
                "Test suite '" + name + "' can't be created"
              ),
              complete: function () {
                $('#redcase-dialog').dialog('close');
              }
            }
          );
          Redcaser.api.apiCall(apiParms);
        }
      }
    });
  };

  var renameSuite = function (params) {
    var node = self.tree.get_node(params.reference);
    $('#redcase-dialog').dialog({
      title: 'Rename test suite',
      modal: true,
      resizable: false,
      buttons: {
        OK: function () {
          var name = $('#redcase-dialog-value').val();
          var apiParms = $.extend({},
            Redcaser.api.testSuite.update(
              node.original.suite_id
            ), {
              params: {
                new_name: name
              },
              success: function () {
                self.tree.set_text(node, name);
              },
              errorMessage: (
                "Can't rename '" + node.text + "'"
              ),
              complete: function () {
                $('#redcase-dialog').dialog('close');
              }
            }
          );
          Redcaser.api.apiCall(apiParms);
        }
      },
      open: function () {
        var dialog = $(this);
        dialog.keydown(function (event) {
          if (event.keyCode === 13) {
            event.preventDefault();
            $('#redcase-dialog')
              .parents()
              .find('.ui-dialog-buttonpane button')
              .first()
              .trigger('click');
          }
        });
      }
    });
  };

  var viewCase = function (params) {
    var node = self.tree.get_node(params.reference);
    window.open('../../issues/' + node.original.issue_id, 'test');
  };

  var getItems = function (node) {
    var items = {};
    var selectionType = self.getSelectionType(self.tree);
    if (selectionType < 3) {
      items = $.extend(items, commonItems);
    }
    // Testcase
    if (selectionType === 0) {
      $.extend(items, caseItems);
    }
    // Testsuite
    if (selectionType === 1) {
      $.extend(items, suiteItems);
    }
    // Testsuite or Special
    if ((selectionType === 1) || (selectionType === 3)) {
      $.extend(items, specialSuiteItems);
    }
    return items;
  };

  var build = function (params) {
    var tree = $('#management_test_suite_tree_id')
      .jstree({
        core: {
          check_callback: checkCallback,
          data: {
            type: 'GET',
            url: (
              Redcaser.api.context + Redcaser.api.testSuite.controller
            )
          }
        },
        // Bug workaround, should only be in "dnd" settings when
        // JSTree is fixed.
        drag_selection: true,
        dnd: {
          always_copy: true,
          drag_selection: true,
          is_draggable: isDraggable
        },
        types: {
          '#': {
            valid_children: ['root']
          },
          root: {
            valid_children: ['suite', 'case']
          },
          suite: {
            valid_children: ['suite', 'case']
          },
          'default': {
            valid_children: []
          },
          'case': {
            valid_children: []
          }
        },
        contextmenu: {
          items: getItems
        },
        plugins: ['dnd', 'types', 'contextmenu']
      });
    tree.on('copy_node.jstree', onCopy);
    self.tree = $.jstree.reference(tree);
  };

};

$(function () {
  Redcaser.testSuiteTree = new RedcaserTestSuiteTree();
});
