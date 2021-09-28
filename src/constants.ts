export const AUTHENTICATION_PASSWORD = 'a_.=bDH38y7K'
export const IS_AUTHENTICATION_ACTIVE = true

// DEV
// export const BACKEND_MOBILE_SERVER_URL = "http://localhost:7779"
// export const API_KEY = 'JeightIsedBielimDiGriccemdijRaijErrOkJofkarsodlorr'

// INTERNAL
export const BACKEND_MOBILE_SERVER_URL = process.env.BASE_URL ?? 'https://internal.api.localeez.adveez.eu'
export const API_KEY = process.env.API_KEY ?? 'DreicelickCeytathPyrucouWiBlagootarjArrAytodkifgin'

export const LAST_SEEN_DISAPPEAR_THRESHOLD = 5
export const LAST_SEEN_CLICKABLE_THRESHOLD = 3

export const ADVEEZ_COMPANY_ID = 0x8e09
export const FAMA_SCRREEN_DEVICE_ID = 0x05

export const FAMA_SCREEN_SERVICE = {
  UUID: '744bba04-5d78-4411-a0b2-4d1f38a485e3',
  CHARACTERISTICS: {
    FAMA_STATE: '95d45502-6cb4-4125-99d5-0146add099ec',
    RELAY_HOLDING_TIME: '68d6b4f2-6cb4-4125-99d5-0146add099ec',
    START_OK: '54e8AD69-6cb4-4125-99d5-0146add099ec',
    PASSWORD: '10991b31-6cb4-4125-99d5-0146add099ec'
  }
}

export const STORAGE_LOGIN_KEY = '@storage_login_key'
export const STORAGE_FIRST_NAME_KEY = '@storage_first_nam_key'
export const STORAGE_LAST_NAME_KEY = '@storage_last_name_key'
export const STORAGE_DRIVER_ID_KEY = '@storage_driver_id_key'
export const STORAGE_PASSWORD_KEY = '@storage_password_key'
export const STORAGE_ROLE_KEY = '@storage_role_key'
export const STORAGE_LANGUAGE_KEY = '@storage_language_key'
export const STORAGE_TIME_DISCONNECTION_KEY = '@storage_time_disconnection_key'
export const STORAGE_REMEMBER_LOGIN_KEY = '@storage_remember_login_key'
export const STORAGE_TAG_ID_KEY = '@storage_tag_id_key'

export const WINDOW_OFFSET = 24

export const INITIAL_DATE_OFFSET = 8
