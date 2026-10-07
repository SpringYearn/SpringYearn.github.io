import type { Locale } from "../site-language";
type Story = { paragraphs: string[]; credit?: { before: string; after: string } };
export type WorkStoryData = { software: string[]; text: Record<Locale, Story>; summary?: Record<Locale, string>; externalLink?: { href: string; label: Record<Locale, string> } };
export const workStories: Record<string, WorkStoryData> = {
  "04": {
    summary: { en: "A school assignment and my first complete typography piece.", zh: "學校作業，也是我第一次完成一整部 Typography 作品。", ja: "学校の課題で、初めて最後まで作ったタイポグラフィ作品。", ko: "학교 과제로 처음부터 끝까지 완성한 첫 타이포그래피 작품이에요.", ru: "Школьное задание и моя первая полноценная типографическая работа.", vi: "Bài tập ở trường và tác phẩm typography hoàn chỉnh đầu tiên của mình." },
    software: ["DaVinci Resolve 18", "Blender 3.6"],
    text: {
      zh: { paragraphs: ["這是學校的作業，算是第一次做一整個完整的 Typography，所以有很多地方有不足之處。", "也有許多渲染問題，不過這對我來說已經盡力了。"] },
      en: { paragraphs: ["This was a school assignment, and my first complete typography piece, so there are quite a few rough spots.", "I ran into plenty of rendering issues too, but this was the best I could do."] },
      ja: { paragraphs: ["学校の課題で、ひとつのタイポグラフィ作品を最初から最後まで作ったのはこれが初めてでした。なので、足りないところもかなりあります。", "レンダリングの問題もいろいろありましたが、自分なりに精いっぱいやった作品です。"] },
      ko: { paragraphs: ["학교 과제로, 처음부터 끝까지 완성한 첫 타이포그래피 작품이라 부족한 부분이 많아요.", "렌더링 문제도 여러 가지 있었지만, 제 나름대로는 최선을 다했어요."] },
      ru: { paragraphs: ["Это школьное задание и моя первая полноценная типографическая работа, поэтому недочётов в ней немало.", "Проблем с рендерингом тоже было много, но я сделал всё, что мог."] },
      vi: { paragraphs: ["Đây là bài tập ở trường và cũng là lần đầu mình làm một tác phẩm typography hoàn chỉnh từ đầu đến cuối, nên còn nhiều điểm chưa tốt.", "Mình cũng gặp khá nhiều vấn đề khi render, nhưng với mình thì đã cố gắng hết sức rồi."] },
    },
  },
  "28": {
    summary: { en: "A stylized CS edit to Pinegrove - Need 2, with a relaxed, old-newspaper mood.", zh: "以 Pinegrove - Need 2 剪出的風格化 CS 作品，帶著愜意與舊報紙的氣息。", ja: "Pinegrove - Need 2 で作った、穏やかで古い新聞のような雰囲気の CS 編集。", ko: "Pinegrove - Need 2로 만든, 여유롭고 오래된 신문 같은 분위기의 CS 편집이에요.", ru: "Стилизованный монтаж по CS под Pinegrove - Need 2: спокойствие и настроение старой газеты.", vi: "Bản dựng CS được cách điệu với Pinegrove - Need 2, mang cảm giác thư thả như một tờ báo cũ." },
    software: ["DaVinci Resolve 19"],
    text: {
      zh: { paragraphs: ["這是我少數的 CS 剪輯，歌曲是 Pinegrove - Need 2，我很喜歡這首歌的情緒，有種鄉村、愜意、舊報紙的感覺。", "所以我做了一次極度風格化的嘗試，沒想到評價還不錯，甚至有人花錢找我做同款的剪輯。我幫他剪輯的那部觀看數剛發布沒多久就破了兩萬（我自己的頻道都沒那麼高的流量嗚嗚嗚嗚）。"] },
      en: { paragraphs: ["This is one of my few CS edits, set to Pinegrove - Need 2. I really like the mood of this song: rural, relaxed, with the feel of an old newspaper.", "So I tried a really stylized approach. The response was better than I expected—someone even commissioned me to make an edit in the same style. The one I made for them passed 20,000 views not long after release. My own channel doesn't even get that kind of traffic, sob sob."] },
      ja: { paragraphs: ["数少ない CS の編集作品のひとつで、曲は Pinegrove - Need 2 です。この曲の雰囲気がとても好きで、田舎の穏やかさや古い新聞のような感じがあります。", "そこで、かなりスタイルを強く出した編集を試してみました。思ったより評判がよく、同じスタイルの編集を有料で頼んでくれた人までいました。その人のために作った動画は公開から間もなく2万再生を超えました。自分のチャンネルはそんなに再生されないのに、ううう。"] },
      ko: { paragraphs: ["제가 만든 몇 안 되는 CS 편집 중 하나이고, 곡은 Pinegrove - Need 2예요. 시골의 여유와 오래된 신문 같은 느낌이 있어서 이 곡의 분위기를 정말 좋아해요.", "그래서 스타일을 아주 강하게 밀어붙여 봤어요. 생각보다 반응이 좋았고, 같은 스타일의 편집을 돈을 내고 의뢰한 사람도 있었어요. 그분을 위해 만든 영상은 공개한 지 얼마 되지 않아 2만 조회 수를 넘었죠. 제 채널은 그런 조회 수도 안 나오는데, 흑흑."] },
      ru: { paragraphs: ["Это одна из немногих моих работ по CS. Музыка — Pinegrove - Need 2. Мне очень нравится настроение этой песни: деревенское, спокойное, с ощущением старой газеты.", "Поэтому я попробовал сделать очень стилизованный монтаж. Отзывы оказались лучше, чем я ожидал: мне даже заказали платную работу в том же стиле. Видео, которое я сделал для заказчика, вскоре после публикации набрало больше 20 000 просмотров. У моего канала даже такого трафика нет, эх."] },
      vi: { paragraphs: ["Đây là một trong số ít bản dựng CS của mình, dùng bài Pinegrove - Need 2. Mình rất thích cảm xúc của bài này: có chút đồng quê, thư thả và cảm giác như một tờ báo cũ.", "Vì vậy mình thử một cách dựng được cách điệu rất mạnh. Không ngờ phản hồi khá tốt, thậm chí có người trả tiền để mình dựng một video cùng phong cách. Video mình làm cho họ vượt 20.000 lượt xem không lâu sau khi đăng. Kênh của mình còn chẳng có lượng xem như vậy, huhu."] },
    },
  },
  "14": {
    summary: { en: "An unfinished school project exploring a UI and UX redesign of E排客.", zh: "以 E排客 網站 UI、UX 重新設計為題的學校作業，目前是未完成品。", ja: "E排客 のウェブサイトの UI・UX を再設計する学校の課題。未完成の作品です。", ko: "E排客 웹사이트의 UI와 UX를 다시 디자인한 학교 과제로, 아직 미완성이에요.", ru: "Незавершённое школьное задание по переработке UI и UX сайта E排客.", vi: "Bài tập ở trường về thiết kế lại UI, UX của E排客, hiện vẫn chưa hoàn thành." },
    software: ["Figma"],
    externalLink: {
      href: "https://www.figma.com/proto/2iVV0bFJQ3BMauuAYiHVdQ/%E5%A4%9A%E4%BA%8C%E7%94%B211%E6%9E%97%E4%BD%91_APP%E8%A8%AD%E8%A8%88%E6%88%90%E5%93%81?node-id=8401-2&starting-point-node-id=8401%3A2&t=gXOEUtIq526gKwzl-1",
      label: { en: "Open Figma prototype", zh: "開啟 Figma 原型", ja: "Figma のプロトタイプを開く", ko: "Figma 프로토타입 열기", ru: "Открыть прототип в Figma", vi: "Mở nguyên mẫu Figma" },
    },
    text: {
      zh: { paragraphs: ["這是學校的作業，負責重新設計並改善 E排客 網站的 UI 和 UX。", "這是一個未完成品，老實說我覺得我重新設計的也沒有多好看哈哈哈，不過也算是一種嘗試了，當時的審美水平和技術都不夠。"] },
      en: { paragraphs: ["This was a school assignment to redesign and improve the UI and UX of the E排客 website.", "It's unfinished. Honestly, I don't think my redesign looked all that great either, hahaha. Still, it was a chance to try—my sense of design and skills weren't quite there yet."] },
      ja: { paragraphs: ["学校の課題で、E排客 のウェブサイトの UI と UX を再設計し、改善する担当でした。", "未完成の作品です。正直、自分の再設計もそこまでよく見えるとは思っていません、ははは。でも、ひとつの挑戦にはなりました。当時は見る目も技術もまだ足りなかったんです。"] },
      ko: { paragraphs: ["학교 과제로 E排客 웹사이트의 UI와 UX를 다시 디자인하고 개선하는 일을 맡았어요.", "미완성 작품이에요. 솔직히 다시 디자인한 것도 그렇게 예쁘지는 않은 것 같아요, 하하하. 그래도 하나의 시도였고, 당시에는 디자인을 보는 눈과 기술이 아직 부족했어요."] },
      ru: { paragraphs: ["Это школьное задание: я отвечал за переработку и улучшение UI и UX сайта E排客.", "Проект не закончен. Честно говоря, мой вариант тоже не кажется мне таким уж красивым, хахаха. Но попробовать всё равно было полезно: тогда мне ещё не хватало насмотренности и навыков."] },
      vi: { paragraphs: ["Đây là bài tập ở trường, mình phụ trách thiết kế lại và cải thiện UI, UX của website E排客.", "Đây là tác phẩm chưa hoàn thành. Thật lòng mình cũng không thấy bản thiết kế lại đẹp đến mức nào, hahaha. Nhưng đó vẫn là một lần thử, vì khi ấy gu thẩm mỹ và kỹ năng của mình còn chưa đủ."] },
    },
  },
  "02": {
    software: ["DaVinci Resolve 19", "Blender 4.5"],
    text: {
      zh: { paragraphs: ["這是我用來參加 ACEEC 25 的作品（獲得了第 7 名），同時也是我成為 ATLAS T2 成員的作品。", "老實說在剪的時候沒有想到這部的評價會那麼好，我只記得這個專案讓我的電腦崩潰了好幾次哈哈哈哈。"] },
      en: { paragraphs: ["This was my entry for ACEEC 25, where it placed 7th. It was also the piece that got me into ATLAS T2.", "Honestly, I had no idea it would be received so well while I was editing it. What I do remember is this project crashing my computer several times, hahaha."] },
      ja: { paragraphs: ["ACEEC 25 に出すために制作した作品で、7位になりました。この作品がきっかけで ATLAS T2 のメンバーにもなりました。", "正直、編集中はこんなに評価してもらえるとは思っていませんでした。覚えているのは、このプロジェクトで何度もパソコンが落ちたことくらいです、ははは。"] },
      ko: { paragraphs: ["ACEEC 25에 출품해 7위를 차지한 작품이에요. 이 작품을 계기로 ATLAS T2 멤버가 되기도 했어요.", "솔직히 편집할 때는 이렇게 좋은 평가를 받을 줄 몰랐어요. 이 프로젝트 때문에 컴퓨터가 여러 번 뻗었던 것만 기억나요, 하하하."] },
      ru: { paragraphs: ["Эту работу я сделал для ACEEC 25, где она заняла 7-е место. Благодаря ей я также стал участником ATLAS T2.", "Честно говоря, во время монтажа я не ожидал такой хорошей реакции. Зато отлично помню, как этот проект несколько раз довёл мой компьютер до сбоя, хахаха."] },
      vi: { paragraphs: ["Đây là tác phẩm mình làm để tham gia ACEEC 25 và đạt hạng 7. Nó cũng là tác phẩm giúp mình trở thành thành viên ATLAS T2.", "Thật lòng, lúc dựng mình không nghĩ tác phẩm sẽ được đón nhận tốt đến vậy. Mình chỉ nhớ dự án này làm máy tính sập mấy lần, hahaha."] },
    },
  },
  "01": {
    software: ["DaVinci Resolve 20", "Blender 4.5"],
    text: {
      zh: { paragraphs: ["這應該算是我 2026 年少數的個人作品，其實一開始我想剪的歌是 Zeruel 的 Avalon，但是已經有很多人剪過了，所以我想要做些創新。", "我一直想嘗試這種風格，因為真的很酷！子彈運鏡的部分費了好大的工夫，才做出來還算能看的畫面。"] },
      en: { paragraphs: ["This is one of the few personal edits I made in 2026. I originally wanted to use Avalon by Zeruel, but plenty of people had already edited to it, so I wanted to try something different.", "I'd wanted to try this style for a while because it's just really cool! The bullet-camera shots took a lot of work before they looked reasonably decent."] },
      ja: { paragraphs: ["2026年に作った数少ない個人作品のひとつです。最初は Zeruel の Avalon で編集しようと思っていましたが、すでに多くの人が使っていたので、少し違うことを試したくなりました。", "このスタイルは本当にかっこいいので、ずっと挑戦してみたかったんです！弾丸を追うカメラワークは、なんとか見られる映像になるまでかなり苦労しました。"] },
      ko: { paragraphs: ["2026년에 만든 몇 안 되는 개인 작품 중 하나예요. 처음에는 Zeruel의 Avalon으로 편집하려 했는데, 이미 많은 사람이 사용한 곡이라 조금 다른 걸 해 보고 싶었어요.", "이 스타일은 정말 멋져서 전부터 도전해 보고 싶었어요! 총알을 따라가는 카메라 장면은 그럭저럭 볼 만한 화면을 만들기까지 꽤 고생했어요."] },
      ru: { paragraphs: ["Это одна из немногих моих личных работ за 2026 год. Сначала я хотел сделать монтаж под Avalon от Zeruel, но эту песню уже использовали многие, и мне захотелось попробовать что-то другое.", "Я давно хотел попробовать такой стиль: он просто очень крутой! Над пролётами камеры за пулей пришлось немало потрудиться, прежде чем кадры стали выглядеть хотя бы прилично."] },
      vi: { paragraphs: ["Đây là một trong số ít tác phẩm cá nhân mình làm trong năm 2026. Ban đầu mình muốn dựng với bài Avalon của Zeruel, nhưng đã có nhiều người dùng bài đó rồi nên mình muốn thử điều gì khác.", "Mình đã muốn thử phong cách này từ lâu vì nó thật sự rất ngầu! Phần camera theo viên đạn tốn rất nhiều công sức mới cho ra những cảnh nhìn cũng tạm ổn."] },
    },
  },
  "03": {
    software: ["DaVinci Resolve 19", "Blender 4.4"],
    text: {
      zh: { paragraphs: ["這是我用來參加 EPHEC 的作品（獲得了第三名），同時也是我 2025 年裡最滿意的其中幾個作品。", "我希望讓這整部作品的節奏與情緒保持一種美麗而乾淨的感受，所以我也沒有做太多過度的調色（我平常的調色都蠻「用力」的，哈哈哈）。", "在做開頭的草地時，我的 Blender 一直崩潰，不過完成後的成就感真的很大。如果要說有什麼不滿意的地方，那可能就是 Sage 的死亡畫面穿模了，以及最後一個場景的打光有點平淡。"], credit: { before: "開頭第一幕借鑒了 ", after: " 的 Flourish（他剪得很好，你們也該去看看）。" } },
      en: { paragraphs: ["This was my entry for EPHEC, where it placed 3rd. It's also one of the pieces I'm happiest with from 2025.", "I wanted the whole edit to feel beautiful and clean in both its rhythm and emotion, so I held back on the color grade. My grades are usually pretty heavy-handed, hahaha.", "Blender kept crashing while I was making the opening grass scene, but finishing it felt really rewarding. If I had to pick things I'm not happy with, they'd be the clipping in Sage's death scene and the rather flat lighting in the last scene."], credit: { before: "The opening shot takes inspiration from ", after: "'s Flourish. His edit is great—you should go watch it too." } },
      ja: { paragraphs: ["EPHEC に出すために制作し、3位になった作品です。2025年に作った中でも、特に気に入っている作品のひとつです。", "全体のリズムと感情を、美しくすっきりしたものにしたかったので、カラーグレーディングは控えめにしました。普段はけっこう強めに色をつけるんですけどね、ははは。", "冒頭の草地を作っている間、Blender が何度も落ちました。でも完成したときの達成感は本当に大きかったです。気になる点を挙げるなら、Sage が倒れる場面のモデルのめり込みと、最後のシーンの照明が少し平坦なところでしょうか。"], credit: { before: "最初のショットは ", after: " の Flourish を参考にしています。すごくいい編集なので、ぜひ見てみてください。" } },
      ko: { paragraphs: ["EPHEC에 출품해 3위를 차지한 작품이에요. 2025년에 만든 작품 중 특히 만족하는 것 중 하나이기도 해요.", "전체적인 리듬과 감정이 아름답고 깔끔하게 느껴지길 바랐어요. 그래서 색보정을 과하게 하지 않았죠. 평소에는 색보정을 꽤 세게 하는 편인데요, 하하하.", "도입부의 잔디를 만들 때 Blender가 계속 뻗었지만, 완성하고 나니 성취감이 정말 컸어요. 아쉬운 점을 꼽자면 Sage가 죽는 장면의 모델 겹침과 마지막 장면의 조금 밋밋한 조명일 것 같아요."], credit: { before: "첫 장면은 ", after: "의 Flourish를 참고했어요. 정말 잘 만든 편집이라 여러분도 한번 보셨으면 해요." } },
      ru: { paragraphs: ["Эту работу я сделал для EPHEC, где она заняла 3-е место. Это также одна из моих любимых работ за 2025 год.", "Мне хотелось, чтобы ритм и настроение всего монтажа ощущались красивыми и чистыми, поэтому я не стал увлекаться цветокоррекцией. Обычно я с ней довольно сильно давлю, хахаха.", "Пока я делал траву для вступления, Blender постоянно вылетал. Зато закончить эту сцену было очень приятно. Если искать то, чем я недоволен, это пересечение моделей в сцене смерти Sage и немного плоское освещение в последней сцене."], credit: { before: "Первый кадр вдохновлён Flourish от ", after: ". У него отличный монтаж — вам тоже стоит посмотреть." } },
      vi: { paragraphs: ["Đây là tác phẩm mình làm để tham gia EPHEC và đạt hạng 3. Nó cũng là một trong những tác phẩm mình hài lòng nhất năm 2025.", "Mình muốn nhịp điệu và cảm xúc xuyên suốt tác phẩm mang lại cảm giác đẹp và sạch, nên không đẩy phần chỉnh màu quá mạnh. Bình thường mình chỉnh màu khá «nặng tay», hahaha.", "Khi làm cảnh đồng cỏ mở đầu, Blender cứ sập liên tục, nhưng cảm giác hoàn thành nó thật sự rất đã. Nếu phải nói điều chưa ưng ý, có lẽ là phần xuyên mô hình trong cảnh Sage chết và ánh sáng hơi phẳng ở cảnh cuối."], credit: { before: "Cảnh đầu tiên lấy cảm hứng từ Flourish của ", after: ". Bạn ấy dựng rất hay, mọi người cũng nên xem thử nhé." } },
    },
  },
};
