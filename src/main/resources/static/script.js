const userAddFormId = $('#addForm');
const deleteFormId = $('#modalDelete');
const userTableId = $('#userTable');

function insertUser() {

    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    let user = {
        'firstName': userAddFormId.find('#firstName').val(),
        'lastName': userAddFormId.find('#lastName').val(),
        'username': userAddFormId.find('#username').val(),
        'email': userAddFormId.find('#email').val(),
        'age': userAddFormId.find('#age').val(),
        'password': userAddFormId.find('#password').val(),
        'roles': userAddFormId.find('#nRoles')
            .val()
            .map(function (val, index) {
                return {id: val};
            })
    }

    console.log(user);

    let request = new Request('/api/add', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(user)
    });

    fetch(request)
        .then(function (response) {
            if (response.ok) {
                console.info("User " + user.id + " inserted");
                sleep(200);
                $('#tableLink').trigger('click');
            } else {
                userAddFormId.find('#password').addClass('alert alert-danger');
            }
        });

}


function getAllUsers() {
    userTableId.children('#userTableBody').empty();
    fetch('/api/all').then(function (response) {
        if (response.ok) {
            response.json().then(users => {
                users.forEach(user => {
                    newRow(user);
                });
            });
        } else {
            console.error('Request users.json failed ' + response.status + ': ' + response.statusText);
        }
    });
}

function newRow(user) {
    userTableId
        .append($('<tr class="border-top bg-light">').attr('id', 'userRow[' + user.id + ']')
            .append($('<td>').attr('id', 'userData[' + user.id + '][id]').text(user.id))
            .append($('<td>').attr('id', 'userData[' + user.id + '][firstName]').text(user.firstName))
            .append($('<td>').attr('id', 'userData[' + user.id + '][lastName]').text(user.lastName))
            .append($('<td>').attr('id', 'userData[' + user.id + '][username]').text(user.username))
            .append($('<td>').attr('id', 'userData[' + user.id + '][email]').text(user.email))
            .append($('<td>').attr('id', 'userData[' + user.id +'][age]').text(user.age))
            .append($('<td>').attr('id', 'userData[' + user.id + '][roles]').text(user.roles.map(role => role.name)))
            .append($('<td>').append($('<button class="btn btn-sm btn-info">')
                .click(() => {
                    loadModal(user.id);
                }).text('Edit')))
            .append($('<td>').append($('<button class="btn btn-sm btn-danger">')
                .click(() => {
                    loadModal(user.id, false);
                }).text('Delete')))
        );
}

function loadModal(id, editMode = true) {

    fetch('/api/get/' + id, {method: 'GET'})
        .then(function (response) {
                if (response.status !== 200) {
                    console.error('Some problem. Status Code: ' + response.status);
                    if (response.status === 400) {
                        response.text().then((value) => console.warn("Error: " + value));
                    }
                    return;
                }
                response.json().then(function (user) {

                    deleteFormId.find('#id').val(user.id);
                    deleteFormId.find('#firstName').val(user.firstName);
                    deleteFormId.find('#lastName').val(user.lastName);
                    deleteFormId.find('#username').val(user.username);
                    deleteFormId.find('#email').val(user.email);
                    deleteFormId.find('#age').val(user.age);
                    deleteFormId.find('#password').val(user.password);

                    if (editMode) {
                        deleteFormId.find('.modal-title').text('Edit user');
                        deleteFormId.find('#deleterButton').removeClass('btn-danger').addClass('btn-primary')
                            .removeAttr('value')
                            .attr('value', 'Edit')
                            .removeAttr('onClick')
                            .attr('onClick', 'editUser(' + id + ');');
                        Readonly(false);
                    } else {
                        deleteFormId.find('.modal-title').text('Delete user');
                        deleteFormId.find('#deleterButton').removeClass('btn-primary').addClass('btn-danger')
                            .removeAttr('value')
                            .attr('value', 'Delete')
                            .removeAttr('onClick')
                            .attr('onClick', 'deleteUser(' + id + ');');
                        Readonly();
                    }

                    fetch('/api/roles').then(function (response) {
                        if (response.ok) {
                            deleteFormId.find('#Roles').empty();
                            response.json().then(roleList => {
                                roleList.forEach(role => {
                                    deleteFormId.find('#Roles')
                                        .append($('<option>')
                                            .prop('selected', user.roles.filter(e => e.id === role.id).length)
                                            .val(role.id).text(role.name));
                                });
                            });
                        } else {
                            console.error('Request roles.json failed: ' + response.status + ': ' + response.statusText);
                        }
                    });

                    deleteFormId.modal();
                });
            }
        )
        .catch(function (err) {
            console.error('Fetch Error :-S', err);
        });

}


function deleteUser(id) {
    fetch('/api/delete/' + id, {method: 'DELETE'})
        .then(function (response) {
            deleteFormId.modal('hide');
            if (response.status === 404 || response.status === 400) {
                response.text().then((value) => console.warn("Error message: " + value));
                return;
            }
            console.info("User " + id + " deleted");
        });

    deleteFormId.modal('hide');
    userTableId.find('#userRow\\[' + id + '\\]').remove();


}

function editUser(id) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    let user = {
        'id': deleteFormId.find('#id').val(),
        'firstName': deleteFormId.find('#firstName').val(),
        'lastName': deleteFormId.find('#lastName').val(),
        'username': deleteFormId.find('#username').val(),
        'email': deleteFormId.find('#email').val(),
        'age': deleteFormId.find('#age').val(),
        'password': deleteFormId.find('#password').val(),
        'roles': deleteFormId.find('#Roles')
            .val()
            .map(function (val, index) {
                return {id: index + 1, name: val};
            })
    }

    console.log(user);
    let request = new Request('/api/edit', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(user)
    });

    fetch(request)
        .then(function (response) {
            if (response.ok) {
                console.info("User " + user.id + " edited");
            }
        });


    deleteFormId.modal('hide');
    sleep(200);
    getAllUsers();

}


function Readonly(value = true) {
    deleteFormId.find('#firstName').prop('readonly', value);
    deleteFormId.find('#lastName').prop('readonly', value);
    deleteFormId.find('#username').prop('readonly', value);
    deleteFormId.find('#email').prop('readonly', value);
    deleteFormId.find('#age').prop('readonly', value);
    deleteFormId.find('#password').prop('readonly', value);
    deleteFormId.find('#Roles').prop('disabled', value);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

$('#addButton').click(() => {
    insertUser();
    userAddFormId.find('#firstName').val('');
    userAddFormId.find('#lastName').val('');
    userAddFormId.find('#username').val('');
    userAddFormId.find('#email').val('');
    userAddFormId.find('#age').val('');
    userAddFormId.find('#password').val('');
});

$('#newUserLink').click(() => {
    userAddFormId.find('#password').removeClass('alert alert-danger');
    userAddFormId.find('#password').removeAttr('placeholder');

    fetch('/api/roles').then(function (response) {
        if (response.ok) {
            userAddFormId.find('#nRoles').empty();
            response.json().then(roleList => {
                roleList.forEach(role => {
                    userAddFormId.find('#nRoles')
                        .append($('<option>')
                            .val(role.id).text(role.name));
                });
            });
        } else {
            console.error('Request for roles.json failed: ' + response.status + ': ' + response.statusText);
        }
    });
});

$('#tableLink').click(() => {
    getAllUsers();
});

$(document).ready(
    () => {
        getAllUsers();
    }
);