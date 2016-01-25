# roll20-api-scripts
various scripts for roll20, mostly suited for D&D 5E.

## SimpleTables
An attempt to demonstrate how to replace tables with simple scripts, since maintaining and copying tables in Roll20 can be cumbersome and scripts support dice functions.

## ConcentrationCheck
Simple script monitors tokens marked as concentrating for damage and sends a reminder to the DM that they need to make a concentration check including the DC.

## Herbalism
An implementation of the Herbalism tables from /u/dalagrath

## AdvancedFumbleTable
A homebrew fumble table with various effects and save DCs.

## WildMagicSurge
Basic implementation of the Wild Magic Surge table for Wild Sorcerers.

## SpellMishapTable
Simple table for scroll and spell mishaps from the DMG.

## SpeechBalloon
Simple speech balloons based on "Stephen S."'s [ideas](https://app.roll20.net/forum/post/1397909/script-dungeon-buddies-inspired-speech-balloons)

Supports showing multiple balloons at once and uses player's color as bubble tint and scales shown time to the length of the message.

Some ideas not yet implemented:
- support only one bubble per token at a time, reuse existing if possible
- parse inline rolls, table rolls, and macros in the speech bubble and in chat
- optional color parameter to command line
- optional token select parameter