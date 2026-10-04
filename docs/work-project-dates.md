# Work date evidence

V.027 adds sorting and a dated editorial index without treating website upload,
Git checkout or file-copy timestamps as artwork creation dates. All displayed
calendar days use Asia/Taipei. Date collection was performed on 2026-10-05.

The default date badge uses publication time when verified, then an available
file-modification clue, then the original year / month record. These sources are
explicitly labeled. Sorting by source creation or modification shows that field
instead. Unknown dates stay last in both directions. Equal dates keep input order;
partial years / months use their interval start for sorting only.

## Verified publication records

The public YouTube watch pages supplied matching `publishDate`, `uploadDate` and
`datePublished` values. Their timezone offsets were converted to Taipei:

| ID | Work | Original publication timestamp | Taipei date |
| --- | --- | --- | --- |
| 01 | [Blight](https://www.youtube.com/watch?v=GTrQrntgJ-k) | 2026-03-30T22:48:08-07:00 | 2026-03-31 |
| 02 | [In my room](https://www.youtube.com/watch?v=u5NagxwYeoE) | 2025-11-27T02:32:28-08:00 | 2025-11-27 |
| 03 | [14.3 Billion Years](https://www.youtube.com/watch?v=XXijIJn98B4) | 2025-06-28T14:21:09-07:00 | 2025-06-29 |
| 04 | [Look at the sky text pv](https://www.youtube.com/watch?v=LQowVkvM7FE) | 2024-10-23T12:14:28-07:00 | 2024-10-24 |
| 28 | [Recent editing work / Need 2](https://www.youtube.com/watch?v=Gg55gN6nvU0) | 2025-02-12T06:54:55-08:00 | 2025-02-12 |

Instagram's public post and embed pages returned a shell without usable publication
metadata. Do not replace these missing publication dates with guessed shortcode dates.

## Available source-file clues

2,138 candidate images were compared with the website exports using aspect ratio
and downsampled RGB similarity, followed by visual comparison. Twenty matching
images were found, including TIGER STUDY after respecting EXIF orientation. No
usable creation / capture date tags survived in these matching images.

The table records file timestamps, not the beginning or latest revision of the
whole artwork. Exported images, photos, screenshots and downloaded copies can
have later modification times. Their dates therefore remain *file clues*.

| ID | Matching available artifact | File modified | File-created clue used |
| --- | --- | --- | --- |
| 01 | Blight 4kkk.mp4; title corroborated by publication | 2026-03-31 | 2026-03-31 |
| 02 | in myroom sfx_prob4.mp4; title corroborated by publication | 2025-11-27 | 2025-11-27 |
| 03 | 14.3 Billion Years.mp4; title corroborated by publication | 2025-06-29 | 2025-06-29 |
| 05 | 天橋場景 後期.png | 2024-08-24 | 2024-08-24 |
| 06 | fluorescent tree trunk (5).png | 2024-07-14 | Unknown |
| 07 | 子彈碰撞完整.mp4; decoded frame and duration matched | 2024-07-08 | 2024-07-08 |
| 08 | 女 正常.png | 2025-01-31 | 2025-01-31 |
| 09 | 劍.png | 2024-09-18 | 2024-09-18 |
| 10 | 素描.png | 2024-09-16 | 2024-09-16 |
| 11 | 每 完整.png | 2024-05-22 | 2024-05-22 |
| 12 | 角色設計2.png; same drawing with export / color differences | 2023-10-13 | 2023-10-13 |
| 13 | LIN0421.jpg; retained older modification timestamp | 2025-11-13 | Unknown |
| 14 | 螢幕擷取畫面 2024-05-29 000334.png | 2024-05-29 | Unknown |
| 15 | 網頁設計示意圖.jpg; retained older modification timestamp | 2024-06-21 | Unknown |
| 16 | 飲料(x.png | 2023-06-16 | Unknown |
| 17 | 1玻璃瓶蘑菇.png | 2023-06-18 | Unknown |
| 18 | 拉麵.png; same render with export / color differences | 2023-09-07 | Unknown |
| 20 | 可送.png | 2026-04-20 | 2026-04-20 |
| 21 | 小熊運鏡.mov; filename association only, not decoded-frame verification | 2026-04-21 | 2026-04-21 |
| 22 | 74192.jpg; retained older modification timestamp | 2025-01-15 | Unknown |
| 23 | 74193.jpg; EXIF orientation 8, visually and numerically matched | 2025-01-15 | Unknown |
| 24 | 74194.jpg; retained older modification timestamp | 2025-01-15 | Unknown |
| 25 | 角色設計1.jpg; retained older modification timestamp | 2024-06-21 | Unknown |
| 28 | cs need 2.mp4; title corroborated by publication | 2025-02-12 | 2025-02-12 |

Shared copy dates (2023-09-27 and 2026-03-04), creation times later than retained
modification times, and website preparation dates were excluded from creation clues.
Source creation dates above are still artifact timestamps, not verified artwork starts.

19 (PUDDING MOTION STUDY) has no matched source or verified publication date.
26 and 27 have matching IMG_0104 / IMG_0101 copies prepared on 2026-09-02, the
website update day; those timestamps were deliberately rejected. All three remain
undated. No original files were modified, and absolute personal paths are omitted.
