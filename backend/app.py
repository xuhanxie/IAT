from flask import Flask, jsonify, request
from utils.database import connect
from utils.json_parser import json_parse
from config_loader import load_config
from pymysql.cursors import DictCursor
from flask_cors import CORS
import json
import copy


app = Flask(__name__)
CORS(app)
config = load_config()

@app.route('/')
def index():
    return "Welcome to Bridge Legal Inbound Alert Tool!"

@app.route('/orgList', methods=['GET'])
def get_org_list():
    conn, tunnel = connect(config)
    try:
        with conn.cursor(DictCursor) as cursor:
            query = """
                SELECT DISTINCT organization_id 
                FROM bl_venture_openapi.bl_request_log
                WHERE organization_id > 10;
            """
            cursor.execute(query)
            org_list = cursor.fetchall()
            return jsonify(org_list)
    finally:
        conn.close()
        tunnel.stop()

@app.route('/inbound/history', methods=['GET'])
def get_org_inbound_history():
    org_id = request.args.get('inOrganizationId', type=int)
    if org_id is None:
        return jsonify({"error": "Missing organization ID"}), 400
    
    conn, tunnel = connect(config)
    try:
        with conn.cursor(DictCursor) as cursor:
            query = """
                SELECT log.id, log.organization_id, log.organization_name, 
                       log.request_status, log.response_object_id, log.created_time, 
                       log.response_body, analyse.result
                FROM bl_venture_openapi.bl_request_log log
                LEFT JOIN bl_venture_openapi.bl_request_analyse_result analyse
                ON log.id = analyse.request_log_id
                WHERE log.organization_id = %s and log.endpoint_id=3
                ORDER BY log.id DESC
            """
            cursor.execute(query, (org_id,))
            request_list = cursor.fetchall()
            for _request in request_list:
                result = _request['result']
                if result:
                    # 检查 response_body 是否为 None
                    if _request['response_body'] is not None:
                        try:
                            response_body = json.loads(_request['response_body'])
                        except json.JSONDecodeError:
                            # 如果 response_body 不能被解析为 JSON, 处理错误
                            print("Error: Unable to parse 'response_body' as JSON.")
                            response_body = {}  # 使用空字典，以便 format_result 函数可以处理
                    else:
                        # 如果 response_body 为 None, 使用空字典
                        response_body = {}

                    # 对 result 进行格式化并检查 alert
                    data_result, alert = format_result(result, response_body)
                    _request['alert'] = alert
                    json_data = json.dumps(data_result)
                    _request['parsed_result'] = json_data
                else:
                    _request['alert'] = 0
                    _request['parsed_result'] = {}
            print(jsonify(request_list))
            return jsonify(request_list)
        
    finally:
        conn.close()
        tunnel.stop()

@app.route('/inbound/history/detail', methods=['GET'])
def get_request_detail():
    request_id = request.args.get("id", type=int)
    if request_id is None:
        return jsonify({"error": "Missing request ID"}), 400

    conn, tunnel = connect(config)
    try:
        with conn.cursor(DictCursor) as cursor:
            query = """
                SELECT log.response_body, analyse.result
                FROM bl_venture_openapi.bl_request_log log
                LEFT JOIN bl_venture_openapi.bl_request_analyse_result analyse
                ON log.id = analyse.request_log_id
                WHERE log.id = %s and log.endpoint_id=3
                ORDER BY log.id DESC
            """
            cursor.execute(query, (request_id,))
            request_list = cursor.fetchall()
            for _request in request_list:
                result = _request['result']
                if result:
                    # 检查 response_body 是否为 None
                    if _request['response_body'] is not None:
                        try:
                            response_body = json.loads(_request['response_body'])
                        except json.JSONDecodeError:
                            # 如果 response_body 不能被解析为 JSON, 处理错误
                            print("Error: Unable to parse 'response_body' as JSON.")
                            response_body = {}  # 使用空字典，以便 format_result 函数可以处理
                    else:
                        # 如果 response_body 为 None, 使用空字典
                        response_body = {}

                    # 对 result 进行格式化并检查 alert
                    data_result, alert = format_result(result, response_body)
                    _request['alert'] = alert
                    json_data = json.dumps(data_result)
                    _request['parsed_result'] = json_data
                else:
                    _request['alert'] = 0
                    _request['parsed_result'] = {}

            return jsonify(request_list)
    finally:
        conn.close()
        tunnel.stop()




def format_result(result, response_body):
    res = {}
    result = json.loads(result)
    resultData = result.get('data', {})
    alert = 0  # 默认没有警告

    for part in ['reqHeaders', 'reqParams', 'reqBody']:
        section = resultData.get(part, {})  
        res[part] = []

        for item in section.get('result', []):
            fieldName = item.get('key', '')
            fieldValue = item.get('value', '')
            important_field = item.get('isImportant', False)
            reasons = []

            for r in item.get('results', []):
                if r.get('level') == "error":
                    reasons.append(r.get('desc', ''))
                    # 更新 alert 状态
                    if important_field and alert != 1:
                        alert = 1
                    elif not important_field and alert == 0:
                        alert = -1

            reason = "; ".join(reasons)
            match = not bool(reasons)
            response_val = json_parse(response_body, fieldName)

            tmp = {
                'fieldName': fieldName,
                'request_value': fieldValue,
                'response_value': response_val,
                'important': important_field,
                'match': match,
                'reason': reason
            }
            res[part].append(tmp)

    return res, alert


if __name__ == '__main__':
    app.run(debug=True)
