# Change log

## 1.0.0 Beta 2

### Added

- (role-reaction) Check if the member has already this role.
- (process-infos) Add `process-infos` command.

### Changed

- (command-fablab) Allow modification of the previous time.
- (role-reaction) Send plural log message if multiple roles.

### Fixed

- (command-fablab) Check if received attachment is an image.
- (command-fablab) Check if the maximum number of fields is not reached.
- (role-reaction) Exclude roles `managed` and `@everyone` role.
- (GuildMember) `displayAvatarURL` returns null if undefined.

## 1.0.0 Beta 1

### Added

- (command-fablab) Check if the message is editable and if the order status allows this command.
- (GuildMemberAdd) `createdTimestamp` and `joinedTimestamp` to log message.
- (GuildMemberRemove) `createdTimestamp`, `joinedTimestamp` and `leftTimestamp` to log message.

### Fixed

- (messageUpdate) Ignore changes to integrations (gif, links).
- (Client) `GuildMembers` Intent missing for `GuildMember` events.
- (GuildMember) `nickname` returns null if undefined.

## 1.0.0 Alpha 2

### Added

- GuildMember and Message events
- Max 5 roles per reaction (role-management)
- `winston` logger

### Changed

- Bump `discord.js` from 14.2.0 to 14.3.0
- Use Typescript

## 1.0.0 Alpha 1

- Initial commit
