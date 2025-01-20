export type Relationship = {
  blocking: boolean
  domain_blocking
  endorsed: boolean
  followed_by?
  following
  following_since
  id
  muting
  muting_notifications
  requested
  showing_reblogs
}

export type Account = {
  /** value is username */
  acct: string
  avatar: string
  /** Date string like 2025-01-01T10:34:12.000000Z */
  created_at: string
  discoverable: boolean
  display_name: string
  followers_count: number
  following_count: number
  header_bg: string | null
  id: string
  is_admin: boolean
  last_fetched_at: null
  local //: true,
  location // : null
  locked: boolean
  /** bio */
  note: string
  /** bio */
  note_text: string
  pronouns: string[]
  source: LoginUserSource
  /** url of profile, for pixelfed: https://<instance>/<username> */
  url: string
  username: string
  website: string
}

/** this is saved */
export interface LoginUserResponse extends Account {
  statuses_count: number
  settings: LoginUserSettings
}

export type LoginUserSettings = {
  crawlable: boolean
  disable_embeds: boolean
  high_contrast_mode: boolean
  indexable: boolean
  is_suggestable: boolean
  media_descriptions: boolean
  public_dm: boolean
  reduce_motion: boolean
  show_atom: boolean
  show_profile_follower_count: boolean
  show_profile_following_count: boolean
  video_autoplay: boolean
}

export type LoginUserSource = {
  privacy: 'public' | string // TODO
  sensitive: boolean
  /** language code like 'en' */
  language: string
  /** bio */
  note: string
  fields: any[]
}
