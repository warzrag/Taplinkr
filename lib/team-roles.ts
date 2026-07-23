export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum TeamAction {
  VIEW_LINKS = 'view_links',
  CREATE_LINK = 'create_link',
  EDIT_LINK = 'edit_link',
  DELETE_LINK = 'delete_link',
  SHARE_LINK = 'share_link',
  VIEW_MEMBERS = 'view_members',
  INVITE_MEMBER = 'invite_member',
  REMOVE_MEMBER = 'remove_member',
  CHANGE_ROLE = 'change_role',
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',
  DELETE_TEAM = 'delete_team',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
}

const PERMISSIONS: Record<TeamRole, TeamAction[]> = {
  [TeamRole.OWNER]: Object.values(TeamAction),
  [TeamRole.ADMIN]: [
    TeamAction.VIEW_LINKS,
    TeamAction.CREATE_LINK,
    TeamAction.EDIT_LINK,
    TeamAction.DELETE_LINK,
    TeamAction.SHARE_LINK,
    TeamAction.VIEW_MEMBERS,
    TeamAction.INVITE_MEMBER,
    TeamAction.REMOVE_MEMBER,
    TeamAction.VIEW_SETTINGS,
    TeamAction.EDIT_SETTINGS,
    TeamAction.VIEW_ANALYTICS,
    TeamAction.EXPORT_DATA,
  ],
  [TeamRole.EDITOR]: [
    TeamAction.VIEW_LINKS,
    TeamAction.CREATE_LINK,
    TeamAction.EDIT_LINK,
    TeamAction.SHARE_LINK,
    TeamAction.VIEW_MEMBERS,
    TeamAction.VIEW_SETTINGS,
    TeamAction.VIEW_ANALYTICS,
  ],
  [TeamRole.MEMBER]: [
    TeamAction.VIEW_LINKS,
    TeamAction.CREATE_LINK,
    TeamAction.EDIT_LINK,
    TeamAction.SHARE_LINK,
    TeamAction.VIEW_MEMBERS,
    TeamAction.VIEW_SETTINGS,
    TeamAction.VIEW_ANALYTICS,
  ],
  [TeamRole.VIEWER]: [
    TeamAction.VIEW_LINKS,
    TeamAction.VIEW_MEMBERS,
    TeamAction.VIEW_SETTINGS,
    TeamAction.VIEW_ANALYTICS,
  ],
}

export function hasTeamActionPermission(role: string | null | undefined, action: TeamAction): boolean {
  const permissions = PERMISSIONS[role as TeamRole]
  return Array.isArray(permissions) && permissions.includes(action)
}
