# NodeBB Dropbox SSO

NodeBB Plugin that allows users to login/register via their Dropbox account.

## Installation

    npm install nodebb-plugin-sso-dropbox

## Configuration

1. Create a **Dropbox API App** via the [App Console](https://www.dropbox.com/developers/apps)
1. Locate your Client ID and Secret
1. Set your "Redirect URI" as the domain you access your NodeBB with `/auth/dropbox/callback` appended to it (e.g. `https://forum.mygreatwebsite.com/auth/dropbox/callback`)