from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID

def main(context):
    context.log("Function execution started")
    client = (
        Client()
            .set_endpoint("https://sfo.cloud.appwrite.io/v1")
            .set_project("68bf36dd001f9ef1d5b6")  
            .set_key(context.req.headers["x-appwrite-key"])
    )

    tablesDB = TablesDB(client)
    context.log("Client and TablesDB initialized")
    try:
        result = tablesDB.get_row(
            database_id = '68c065810005868a248c',
            table_id = 'visits',
            row_id = '68c0660c002eaf43755e',
        )
        context.log("Current visit number: " + str(result))
        result = tablesDB.increment_row_column(
            database_id = '68c065810005868a248c',
            table_id = 'visits',
            row_id = '68c0660c002eaf43755e',
            column = 'visitnumber',
            value = 1, # optional
            max = 2e64 # optional
        )

        context.log("Row updated: " + str(result))
    except Exception as e:
        context.error("Failed to update row: " + e.message)
        return context.response.text("Failed to update row")

    return context.res.json(
        {
            "motto": "done"
        }
    )