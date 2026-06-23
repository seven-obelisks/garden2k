---
title: "About Garden2K"
date: 2026-06-01T01:20:00.000-05:00
---

Garden2K is a heavily modified version of the Ananke theme for Hugo that comes with an event management system. It features a calendar view and .ICS exports, and allows for authorized users to edit site content via Sveltia CMS / GitHub OAuth. It is configured to automatically redeploy every 24 hours to update event hierarchy based on date values provided by the user. 

Deployed via CloudFlare Pages' free tier, sites using Garden2k can be run in perpetuity for no cost. It was built to be an open-source alternative to expensive and clunky event publication tools currently available on platforms such as WordPress. It is designed for gaming guilds, student groups, and community leagues that regularly host events to have a flexible marketing platform without the high costs typically associated with these tools.

## Key Features

- Event content stored as Markdown
- Mobile responsive calendar page
- Upcoming/past event handling
- Event detail pages
- Automatic .ICS output for iCalendar
- Sveltia CMS admin interface
- Cloudflare Pages deployment on free tier
- GitHub OAuth auth for CMS access (users must be explicitly granted access)
- Daily automated builds for automatic event updating
- Homepage banners can be added, removed, and edited via CMS


## Requirements for Installation

- Hugo Extended
- Ananke theme
- GitHub OAuth app
- Cloudflare Pages