# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.12.5] 2022-09-23

## Changed

- Use `dns.resolve` instead of `dns.lookup` to resolve api.twitch.tv

## [0.12.4] 2022-09-23

## Changed

- Don't use alpine based image for nextjs

## [0.12.3] 2022-09-21

## Changed

- Auto restart browser if rendering takes too long
- Don't use `--gl=angle` option when rendering banner

## [0.12.2] 2022-09-19

### Changed

- Use `--gl=angle` option when rendering banner

## [0.12.1] 2022-06-10

### Changed

- Cleanup remotion logs
- Cache remotion compositions

## [0.12.0] 2022-06-08

### Added

- Reopen puppeteer if it is closed 

### Fixed

- Delete user endpoint
- Admin banner api endpoint

## [0.11.9] - 2022-05-03

### Added

-   Add free premium plan trial for 7 days

### Fixed

-   Users are actually able to upgrade their subscriptions

## [0.11.8] - 2022-05-02

### Changed

-   Add more details to disable banner content
-   Use Stripe automatic payment methods
-   Added no-ops for some Stripe wehbooks
    -   invoice.payment_succeeded no-op if billing_reason is subscription_cycle
    -   customer.subscription.updated no-op if status is incomplete or incomplete_expired

## [0.11.7] - 2022-04-24

### Added

-   Hex color input on color picker modals

### Changed

-   Account page styling for gift purchases

## [0.11.6]

### Fixed

-   Allow beta partners to fill out application

## [0.11.5]

### Added

-   Added merch release link

## [0.11.4] - 2022-04-01

### Added

-   Added PreGaming banner for partnership

## [0.11.3] - 2022-03-30

### Fixed

-   Apply remotion rate limit on a per-user basis
-   Fix payment modal

## [0.11.2] - 2022-03-25

### Fixed

-   Added BUILD_TARGET environment variable so that we can properly generate static pages

## [0.11.1] - 2022-03-25

### Fixed

-   Updated deployment order so firewall opens before building nextjs image

## [0.11.0] - 2022-03-25

### Added

-   Gifts page
-   Gift pricing on pricing page
-   Gift summary page
-   Gift summary emails

### Changed

-   Let users disconnect their Twitch account
-   Low effort UI improvement to account page
-   New mobile header

### Engineering

-   Organized code into services
-   Turn on TS strict mode
-   Upgrade to TypeScript ^4.6.0 to get access to the `Awaited` utility type.
-

### Fixed

-   Improved Google lighthouse score

## [0.10.7] - 2022-03-16

### Fixed

-   Another partner page bug

## [0.10.6] - 2022-03-16

### Fixed

-   Partner page bug

## [0.10.5] - 2022-03-15

### Fixed

-   Let legacy partners apply for partner program

## [0.10.4] - 2022-03-14

### Fixed

-   Handle Twitter names that are too long properly

## [0.10.3] - 2022-03-13

### Fixed

-   Don't show background page for locked presets.

## [0.10.2] - 2022-03-12

### Fixed

-   Fixed bug that gave everyone membership on frontend

## [0.10.1] - 2022-03-11

### Fixed

-   Sway banner font

## [0.10.0] - 2022-03-11

### Added

-   New navigation menu
-   Sway banner preset

### Changed

-   Pricing page now properly allows customers to change subscriptions
-   Product card components are now compound components

## [0.9.5] - 2022-03-06

### Added

-   Dedicated admin page for partner applications

### Changed

-   Removed sign in page
-   Made account page nofollow and noindex
-   Revamp partner dashboard

## [0.9.4] - 2022-03-05

### Added

-   Upload a banner image directly to the website

## [0.9.3] - 2022-03-04

### Fixed

-   Remove partner block from landing page

### Changed

-   Handle suspended Twitter account errors
-   Better Discord webhooks for new subscriptions

## [0.9.2] - 2022-03-03

### Fixed

-   Add production price IDs to commission map

## [0.9.1] - 2022-03-03

### Fixed

-   Offline banner change option not showing up

## [0.9.0] - 2022-03-03

### Added

-   Partner Program 🎉

## [0.8.2] - 2022-02-24

### Added

-   Banner templates

### Fixed

-   Missing avatars

## [0.8.1] - 2022-02-19

### Fixed

-   Refresh slider visual bug on mobile

## [0.8.0] - 2022-02-19

### Added

-   Banner refreshing UI and pricing

### Changed

-   Name in package.json is now "pulsebanner" instead of "streamlux-saas"

### Fixed

-   Locked remotion version to 2.6.6

## [0.7.11] - 2022-02-17

### Added

-   Banner refreshing for personal users

## [0.7.10] - 2022-02-16

### Added

-   Banner refreshing for pro users

## [0.7.9] - 2022-02-15

Patch release

## [0.7.8] - 2022-02-15

Patch release

## [0.7.7] - 2022-02-04

### Added

-   Banner refreshing

## [0.7.6] - 2022-02-02

### Changed

-   Banner feature is now static and we don't update original banner on streamup

### Fixed

-   Empty profile picture bug

## [0.7.5] - 2022-01-30

### Changed

-   Cleaned up FAQ page code
-   Removed EMGG sale banners

## [0.7.4] - 2022-01-29

### Added

-   FAQ sections and page

## [0.7.3] - 2022-01-28

### Added

-   EMGG sale

## [0.7.2] - 2022-01-28

### Fixed

-   Fix auth redirect from EMGG page

## [0.7.1] - 2022-01-28

### Fixed

-   Always show username on EMGG banner

## [0.7.0] - 2022-01-28

### Added

-   EMGG Special Edition Live Banner

## [0.6.2] - 2022-01-24

### Added

-   Handle and reset accordingly on cancelled PulseBanner membership
-   Logging to go through datadog instead of using console logs

### Changed

-   live_streams table soft check is now a hard check

## [0.6.1] - 2022-01-22

### Fixed

-   Remove hardcoded userId

## [0.6.0] - 2022-01-22

### Added

-   Secured feature endpoints
-   User and webhook admin pages

## [0.5.6] - 2022-01-22

### Fixed

-   Incorrect error log conditional

## [0.5.5] - 2022-01-22

### Fixed

-   Twitch stream link fix

## [0.5.4] - 2022-01-22

### Added

-   Firm check of valid base64 image in DB and enable proper handling
-   Live stream and previous stream tables to track active streamers

### Fixed

-   Actually truncate Twitter name

## [0.5.3] - 2022-01-16

### Added

-   Logging with Winston
-   Datadog log aggregation

### Fixed

-   If Twitter name with "🔴 Live now |" prepended is over 50 characters, then truncate the name.
-   Removed some unnecessary Discord error logs

## [0.5.2] - 2022-01-16

### Removed

-   Sale banner

## [0.5.1] - 2022-01-14

### Added

-   Sale banners

## [0.5.0] - 2022-01-14

### Added

-   Profile picture feature
-   Remotion queues responses

## [0.4.3] - 2022-01-09

### Fix

-   Prevent umami script from being blocked by adblock

## [0.4.2] - 2022-01-09

### Fix

-   Fix Deploy to Production GitHub Action

## [0.4.1] - 2022-01-09

### Fix

-   GitHub action by locking `@prisma/client` and `prisma` to `3.1.1`.

## [0.4.0] - 2022-01-09

### Added

-   Landing page
-   Code of conduct

### Changed

-   New OG image

## [0.3.3] - 2022-01-05

## Removed

-   Disable winter sale
-   Disable snow on website

## Fixed

-   Disable features if they are enabled and oauth fails
-   Prompt user to re-sign in to Twitter if oauth is failing
-   Logging to check user banner is properly stored base64

## [0.3.2] - 2021-12-31

## Fixed

-   Return on error for banner streamdown
-   Bug with Twitter name not updating properly if they change their twitter name manually on Twitter
-   Newsletter signup

## [0.3.1] - 2021-12-29

## Changed

-   Promo sticky text shorter for mobile
-   Added umami event for edit name text
-   Refactor s3 endpoints into utils
-   Improved Twitter API error logging

## Fixed

-   username streamdown logs

## [0.3.0] - 2021-12-20

### Added

-   Holiday decorations
-   Announcement components
-   Name changer feature

### Changed

-   Pricing page layout

### Fixed

-   Catch errors uploading banner to backup bucket
-   Update pricing handling for different levels
-   Watermark now properly removed with remotion rendering

## [0.2.1] - 2021-12-11

### Fixed

-   Listing subscriptions when there are more than 100

## [0.2.0] - 2021-12-11

### Added

-   Inform users that background images should be 1500x500
-   Custom 404 page

### Changed

-   Banner page now uses server side rendering for smoother loading
-   Added another Discord invite button to banner page
-   "Share to Twitter" Tweet format so that the link doesn't get hidden on Twitter

## [0.1.23] - 2021-12-09

### Fixed

-   Banner page
-   Validate access tokens

## [0.1.22] - 2021-12-09

### Fixed

-   Not being able to save banner settings

## [0.1.21] - 2021-12-09

### Fixed

-   Fixed glitch on banner page that shows default banner instead of user settings

## [0.1.20] - 2021-12-09

### Fixed

-   Issue where members couldn't use members-only features

## [0.1.19] - 2021-12-09

### Changed

-   Use twurple library to refresh Twitch user access tokens when getting user session

## [0.1.18] - 2021-12-07

### Changed

-   Font feature is now available

## [0.1.17] - 2021-12-06

### Added

-   Users can select different font's used in their banner (hidden)
-   OG image
-   Added Discord webhook for errors

### Changed

-   Using updated Twitch auth package

## [0.1.16] - 2021-12-05

### Changed

-   Update production GitHub Actions workflow
-   Deploy nestjs to production

## [0.1.15] - 2021-12-05

### Fixed

-   Fixed twitch client token not refreshing

### Added

-   Twitch username is now option to show on your banner
-   All user banners are saved to different bucket for safe keeping and backup on sign up

## [0.1.14] - 2021-12-02

### Fixed

-   Users couldn't sign up if they had created their Twitter account using a phone number rather than an email address (for real this time)

## [0.1.13] - 2021-12-02

### Fixed

-   Users couldn't sign up if they had created their Twitter account using a phone number rather than an email address

## [0.1.12] - 2021-12-02

### Changed

-   Improved pricing page and pricing modal UI
-   Made clear that PulseBanner is free to use
-   Made some API endpoints more secure

### Added

-   Partnered users that will get professional for free
-   Cleanup code handling whether customer is paying or not

## [0.1.11] - 2021-12-01

### Fixed

-   Don't process duplicate streamup notifications

## [0.1.10] - 2021-11-30

### Added

-   Discord webhook on user signup
-   Useful timestamps: updatedAt for banners, createdAt for users

## [0.1.9] - 2021-11-29

### Fixed

-   Handle duplicate streamup notifications without breaking

## [0.1.8] - 2021-11-29

### Added

-   Share to Twitter widget on banner page
-   Help link to Discord server
-   Social media links to footer

## [0.1.7] - 2021-11-29

### Fixed

-   Connect accounts modal not popping up after connecting to Twitter on banner page

## [0.1.6] - 2021-11-29

### Fixed

-   Stream thumbnail URLs were not getting fetched and passed into the Remotion server API call
-   Webhooks admin panel
-   API issue with /api/twitch/notification where we were getting the wrong element in array causing 500's.

### Added

-   Sample image banner backgrounds that any user level can use. Let users understand how the background images work.
-   Added toasts for when the banner is enabled/disabled letting users know the banner will/will not update next time they start streaming.

## [0.1.5] - 2021-11-24

### Added

-   Added redirect from `/` to `/banner`.
-   Restricted custom image setting for background to paying users only.

## [0.1.4] - 2021-11-24

Initial pre-release
