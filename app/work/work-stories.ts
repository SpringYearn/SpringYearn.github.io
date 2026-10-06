import type { Locale } from "../site-language";
type Story = { paragraphs: string[]; credit?: { before: string; after: string } };
export type WorkStoryData = { software: string[]; text: Record<Locale, Story> };
export const workStories: Record<string, WorkStoryData> = {
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
