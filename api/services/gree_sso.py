import json

import requests
from flask import request
from pydantic import BaseModel

import models
from extensions.ext_redis import redis_client

from .account_service import AccountService, RegisterService, TokenPair
from  controllers.web.passport import TokenPassportService
# 格力单点登录
GREE_SSO_URL_GET_TOKEN = 'http://wfserver.gree.com/sso/ssoapi/GetToken'
GREE_SSO_URL_GET_USER_INFO = 'http://wfserver.gree.com/sso/ssoapi/GetUserInfo'
GREE_SSO_APP_ID = '0347f117-1b67-46a1-b4ec-a173f7bffa14'
GREE_SSO_APP_KEY = '2ce5a8c1-3a99-4036-92cc-a8f434b1a17c'
# redis key
GREE_REDIS_KEY = 'gree:user:mail:'


# 用户数据
class UserInfo(BaseModel):
    user_id: str | None = None
    OpenID: str | None = None
    AppAccount: str | None = None
    StaffID: str | None = None
    EmpID: str | None = None
    HREmpID: str | None = None
    OrgL1Alias: str | None = None
    OrgL1Name: str | None = None
    OrgL2Alias: str | None = None
    OrgL2Name: str | None = None
    OrgL3Alias: str | None = None
    OrgL3Name: str | None = None
    Job: str | None = None
    Token: str | None = None
    UserName: str | None = None
    DepartmentID: str | None = None
    DepartmentName: str | None = None
    CompanyID: str | None = None
    CompanyName: str | None = None
    Title: str | None = None
    Office: str | None = None
    InService: bool | None = None
    Phone: str | None = None
    OfficeLeader: str | None = None
    DeptLeader: str | None = None
    IP: str | None = None


# 调用接口返回的数据
class ResultInfo(BaseModel):
    Success: bool
    Message: str


# 根据callback获取token
def get_token(callback: str) -> ResultInfo:
    ip = request.remote_addr
    forwarded_ip = request.headers.get('X-Forwarded-For')
    if forwarded_ip:
        ip = forwarded_ip.split(',')[0].split()
    params = {
        'appid': GREE_SSO_APP_ID,
        'appkey': GREE_SSO_APP_KEY,
        'ip': ip,
        'callback': callback
    }
    response = requests.get(GREE_SSO_URL_GET_TOKEN, params=params)
    if response.status_code == 200:
        json_data = response.json()
        if 'Success' in json_data or 'Message' in json_data:
            json_data = ResultInfo(**json_data)
            return json_data


# 根据token查询用户信息
def get_user_info(token: str) -> UserInfo:
    ip = request.remote_addr
    forwarded_ip = request.headers.get('X-Forwarded-For')
    if forwarded_ip:
        ip = forwarded_ip.split(',')[0].split()
    params = {
        'appid': GREE_SSO_APP_ID,
        'appkey': GREE_SSO_APP_KEY,
        'ip': ip,
        'token': token
    }
    response = requests.get(GREE_SSO_URL_GET_USER_INFO, params=params)
    if response.status_code == 200:
        json_data = response.json()
        user_info = UserInfo(**json_data)
        return user_info


# 获取redis——key
def get_redis_key(mail: str) -> str:
    return GREE_REDIS_KEY + mail


# 根据token获取userinfo
def get_gree_token_pair(token: str) -> TokenPair:
    user_info = get_user_info(token)
    account = AccountService.get_user_through_email(user_info.OpenID)
    if not account:
        #  没有账号信息新注册再登录
        email = user_info.OpenID
        name = user_info.UserName
        password = user_info.AppAccount + "@GreeSSO2025"
        language = 'zh-Hans'
        status = models.AccountStatus.ACTIVE
        is_setup = True
        worksapce = False
        account = RegisterService.register(email, name, password, None, None, language, status, is_setup, worksapce)
        # TenantService.create_owner_tenant_if_not_exist(account=account, is_setup=True)
    redis_key = get_redis_key(user_info.StaffID)
    user_info.user_id = account.id
    redis_client.set(redis_key, json.dumps(user_info.__dict__))
    return AccountService.login(account)


class GreeSsoService:

    @staticmethod
    def gree_sso(callback: str) -> TokenPair:
        token = get_token(callback)
        return get_gree_token_pair(token.Message)

    @staticmethod
    def gree_login_by_token(token: str) -> TokenPair:
        return get_gree_token_pair(token)

    @staticmethod
    def gree_passport_by_token(token: str, passport: str) -> str:
        user_info = get_user_info(token)
        account = AccountService.get_user_through_email(user_info.OpenID)
        if not account:
            #  没有账号信息新注册再登录
            email = user_info.OpenID
            name = user_info.UserName
            password = user_info.AppAccount + "@GreeSSO2025"
            language = 'zh-Hans'
            status = models.AccountStatus.ACTIVE
            is_setup = True
            worksapce = False
            account = RegisterService.register(email, name, password, None, None, language, status, is_setup, worksapce)
            # TenantService.create_owner_tenant_if_not_exist(account=account, is_setup=True)
        redis_key = get_redis_key(user_info.StaffID)
        user_info.user_id = account.id
        redis_client.set(redis_key, json.dumps(user_info.__dict__))
        token = TokenPassportService.get_passport_token(user_info.StaffID, passport)
        return token

    @staticmethod
    def gree_authcode_get_mail(token: str) -> str:
        user_info = get_user_info(token)
        account = AccountService.get_user_through_email(user_info.OpenID)
        if not account:
            #  没有账号信息新注册再登录
            email = user_info.OpenID
            name = user_info.UserName
            password = user_info.AppAccount + "@GreeSSO2025"
            language = 'zh-Hans'
            status = models.AccountStatus.ACTIVE
            is_setup = True
            worksapce = False
            account = RegisterService.register(email, name, password, None, None, language, status, is_setup, worksapce)
            # TenantService.create_owner_tenant_if_not_exist(account=account, is_setup=True)
        redis_key = get_redis_key(user_info.StaffID)
        user_info.user_id = account.id
        redis_client.set(redis_key, json.dumps(user_info.__dict__))
        AccountService.login(account)
        return user_info.StaffID


