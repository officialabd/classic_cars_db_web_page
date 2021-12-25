const STRINGS_TYPES = ["CHAR", "VARCHAR", "TEXT"];
const INTEGER_TYPES = ["INT", "INTEGER", "FLOAT", "DOUBLE", "DECIMAL"];
const DATE_TYPES = ["DATE", "DATETIME"];
const OPERATORS = ["<", ">", ">=", "<=", "!="];
const RELATIONS;

$(document).ready(start());

function start() {
    init();
}

function init() {
    const tables_names = get_tables_names();
    init_tables_names(tables_names);
    init_insertion(tables_names);
}

function get_tables_names() {
    let tables_names;
    $.ajax({
        url: "get_tables_names.php",
        cache: false,
        timeout: 2000,
        type: "POST",
        async: false,
        success: function (result) {
            tables_names = JSON.parse(result);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error:\n" + thrownError);
        }
    });
    return tables_names;
}

function init_insertion(tables_names) {
    $("#insert-tables").empty().append(
        "<option selected class='align-middle' value='None'> None </option>");
    for (const i in tables_names) {
        $("#insert-tables").append(
            "<option class='align-middle' value='" + tables_names[i] + "'> "
            + tables_names[i] + " </option>");
    }
    var table_attrs, scted_table;
    $("#insert-tables").on('change', function () {
        scted_table = $("#insert-tables option:selected").val();
        $("#all_search_atts").empty();
        if (scted_table == "None") return;
        table_attrs = desc_table(scted_table);
        let index = 0;
        table_attrs.forEach(attr => {
            $("#all_search_atts").append(
                insertion_item(
                    index++,
                    attr['Field'],
                    attr['Type'],
                    attr['Null'].toLowerCase() == "yes",
                    attr['Key']));
        });
    });

    $("#insert_btn").click(function () {
        if (scted_table == "None" || isEmpty(scted_table)) return;
        let values = [], attrs = [];
        let data_required_filled = false;
        $("#all_search_atts input").each(function () {
            for (let i in table_attrs) {
                if (table_attrs[i]['Field'] == $(this).attr('placeholder')) {
                    if (table_attrs[i]['Null'] == "NO") {
                        if (isEmpty($(this).val())) {
                            $(this).addClass("is-invalid");
                            data_required_filled = false;
                            return;
                        } else {
                            $(this).removeClass("is-invalid");
                            data_required_filled = true;
                        }
                    }
                }
            }
            if (!isEmpty($(this).val())) {
                values.push($(this).val());
                attrs.push($(this).attr('placeholder'));
            }
        });
        if (data_required_filled) {
            init_insertion_request(scted_table, attrs, values);
        }
    });
}

function init_insertion_request(scted_table, attrs, values) {
    console.log(parse_atts(attrs) + "\n" + parse_atts(values));
    // $.ajax({
    //     type: "POST",
    //     url: "insert_row.php",
    //     cache: false,
    //     timeout: 2000,
    //     data: {
    //         'table_name': scted_table,
    //         'attrs': parse_atts(attrs),
    //         'values': parse_atts(values)
    //     },
    //     success: function (response) {

    //     },
    //     error: function (xhr, ajaxOptions, thrownError) {
    //         alert("Error:\n" + thrownError);
    //     }
    // });
}

function insertion_item(index, field, type, is_null, key) {
    let required = "";
    if (!is_null) {
        required = "*";
    }
    let item = "<div class='form-floating mb-3'>"
        + "<input class='form-control' id='attr-" + index + "'"
        + " placeholder='" + field + "'>"
        + " <label for='attr-" + index + "'>" + field + " " + required + "</label>"
        + "</div>";
    return item;
}

function init_tables_names(tables_names) {
    $("#tables-names-menu").empty();
    for (let x in tables_names) {
        $("#tables-names-menu").append("<button id='table-" + x
            + "' class='table-name list-group-item list-group-item-action'> "
            + tables_names[x] + " </button>");
    }
    for (let x in tables_names) {
        $("#table-" + x).click(function () {
            update(tables_names[x]);
        });
    }
}

function update(table_name) {
    show_main_table(table_name);
    init_search_request(table_name);
}

function show_main_table(table_name) {
    $.ajax({
        url: "get_table_content.php", cache: false, timeout: 2000, type: "POST",
        data: {
            table_name: table_name
        },
        success: function (result) {
            build_table(JSON.parse(result), true);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error:\n" + thrownError)
        }
    });
}

function update_search(table_col_names) {
    update_search_selection(table_col_names);
    var counter = 0;
    $("#add_search_item").click(function () {
        $("#all_input_atts").append(build_search_item(counter));
        update_search_item_menu(counter, table_col_names);
        counter++;
    });
}

function build_search_item(index) {
    return "<div id='si-" + index + "' class='mb-1 d-flex align-items-center justify-content-center'> "
        + "<button class='btn btn-secondary dropdown-toggle' type='button' "
        + "data-bs-toggle='dropdown' aria-expanded='false'>Attribute</button> "
        + "<ul id='sit_att-" + index + "' class='p-0 search-item-attrs dropdown-menu'></ul> "
        + "<input type='text' class='form-control' "
        + "aria-label='Text input with dropdown button'> "
        + "<button id='si-" + index + "-b' type='button' class='ms-2 btn-close' "
        + "aria-label='Close-" + index + "'></button>"
        + "</div>";
}

function update_search_selection(table_col_names) {
    let it_att = "";
    for (const tcn in table_col_names) {
        it_att += "<li class='list-group-item'> "
            + "<input class='form-check-input me-1' type='checkbox' "
            + "value='" + table_col_names[tcn] + "'> "
            + table_col_names[tcn] + " </li>";
    }
    $("#insertion-table-attributes").empty().append(it_att);
}

function update_search_item_menu(index, table_col_names) {
    let sit_att = "";
    for (const tcn in table_col_names) {
        sit_att += "<li class='list-group-item'> "
            + "<input class='form-radio-input align-middle' type='radio' name='single-select-attr-"
            + index
            + "' value='" + table_col_names[tcn] + "'> "
            + table_col_names[tcn] + " </li>";
    }
    $("#sit_att-" + index).empty().append(sit_att);
    let temp = index;
    let element = $("#si-" + temp + "-b");
    element.click(function () {
        let pe = document.getElementById("si-" + temp);
        pe.parentNode.removeChild(pe);
        counter--;
    });
}

function init_search_request(table_name) {
    $("#search_btn").click(function () {
        let selected_att = [], search_items = [], search_item_values = [];
        $('#insertion-table-attributes input:checked').each(function () {
            selected_att.push($(this).val());
        });
        $('.search-item-attrs input:checked').each(function () {
            search_items.push($(this).val());
        });
        $('#all_input_atts .form-control').each(function () {
            search_item_values.push($(this).val());
        });

        send_search_request(table_name,
            parse_atts(selected_att),
            parse_search_conditions(table_name, search_items, search_item_values));
    });
}

function build_table(rs, allow_search) {
    const table_col_names = Object.keys(rs[0]);
    if (allow_search) {
        update_search(table_col_names);
    }
    $("#table-headers").empty();
    for (let x in table_col_names) {
        $("#table-headers").append("<th scope='col'> " + table_col_names[x] + "</th>");
    }
    let table_content = "";
    for (let y in rs) {
        table_content += "<tr>";
        for (let x in rs[y]) {
            table_content += "<th scope='row'> " + rs[y][x] + " </th>";
        }
        table_content += "</tr>";
    }
    $("#table-content").empty().append(table_content);
}

function send_search_request(table_name, sctd_attrs, conditions) {
    $.ajax({
        type: "POST",
        url: "execute_query.php",
        timeout: 2000,
        cache: false,
        data: {
            'table_name': table_name,
            'selected_attrs': sctd_attrs,
            'conditions': conditions
        },
        success: function (rs) {
            try {
                console.log(rs);
                build_table(JSON.parse(rs), false);
            } catch (error) {
                alert(error + "\n" + rs);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error:\n" + thrownError);
        }
    });

}

function parse_atts(sctd_att) {
    let selected_attrs = "";
    sctd_att.forEach(att => {
        if (selected_attrs.length > 0) selected_attrs += ", ";
        selected_attrs += att;
    });
    return selected_attrs;
}

function parse_search_conditions(table_name, atts, vals) {
    if (atts.length != 0 && vals.length != 0) {
        // desc_table(table_name, function callback(table_d) {
        //     let conditions = "";
        //     for (const i in atts) {
        //         for (const j in table_d) {
        //             if (table_d[j]['Field'] == atts[i]) {
        //                 if (conditions.length > 0) conditions += " AND ";
        //                 conditions += parse_search_condition(table_d[j]['Type'], atts[i], vals[i]);
        //             }
        //         }
        //     }
        //     cd = conditions;
        //     reject();
        // });
        var table_d = desc_table(table_name);
        let conditions = "";
        for (const i in atts) {
            for (const j in table_d) {
                if (table_d[j]['Field'] == atts[i]) {
                    if (conditions.length > 0) conditions += " AND ";
                    conditions += parse_search_condition(table_d[j]['Type'], atts[i], vals[i]);
                }
            }
        }
        return conditions;
    }
    return "";
}

function parse_search_condition(type, att, val) {
    if (isEmpty(val) || isEmpty(att)) {
        return "";
    }
    let condition = "";
    if (is_integer(type)) {
        if (includes_ops(val)) {
            condition = att + " " + val;
        } else {
            condition = att + " = " + val;
        }
    } else if (is_string(type)) {
        condition = att + " LIKE '%" + val + "%'";
    } else if (is_date(type)) {
        condition = att + " = " + val;
    }
    return condition;
}

function desc_table(table_name) {
    var data;
    $.ajax({
        type: "POST",
        cache: false,
        timeout: 2000,
        async: false,
        url: "desc_table.php",
        data: { 'table_name': table_name },
        success: function (rs) {
            // callback(JSON.parse(rs));
            data = JSON.parse(rs);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error:\n" + thrownError);
        }
    });
    // console.log(data);
    return data;
}

function is_string(type) {
    for (let i = 0; i < STRINGS_TYPES.length; i++) {
        if (type.toLowerCase().includes(STRINGS_TYPES[i].toLowerCase())) {
            return true;
        }
    }
    return false;
}

function is_integer(type) {
    for (let i = 0; i < INTEGER_TYPES.length; i++) {
        if (type.toLowerCase().includes(INTEGER_TYPES[i].toLowerCase())) {
            return true;
        }
    }
    return false;
}

function is_date(type) {
    for (let i = 0; i < DATE_TYPES.length; i++) {
        if (type.toLowerCase().includes(DATE_TYPES[i].toLowerCase())) {
            return true;
        }
    }
    return false;
}

function includes_ops(value) {
    for (let i = 0; i < OPERATORS.length; i++) {
        if (value.includes(OPERATORS[i]))
            return true;
    }
    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isEmpty(value) {
    return (value === '' || value === null || value === undefined || value == null) ? true : false;
}