/*
  ================================================================
   รายการรูปกิจกรรมและคลิปวิดีโอ (มาร์ชแก้ไฟล์นี้)
  ================================================================
   วิธีเพิ่มรูป
   1) วางไฟล์รูปในโฟลเดอร์ของกิจกรรมนั้น เช่น site/assets/activities/bootcamp/
   2) เพิ่ม 1 บรรทัดในวงเล็บ [ ] ของกิจกรรมนั้น ตามตัวอย่าง
        { file: 'assets/activities/bootcamp/drone1.jpg', caption: 'คำบรรยายรูป' },

   วิธีเพิ่มคลิป
   1) วางไฟล์ .mp4 ใน site/assets/videos/
   2) เพิ่ม 1 บรรทัดใน videos (poster คือรูปปก ใส่หรือไม่ใส่ก็ได้)
        { file: 'assets/videos/me.mp4', poster: 'assets/videos/me.jpg', caption: 'แนะนำตัว' },

   วิดีโอในกิจกรรม: ใส่ในวงเล็บ videos: [ ] ของกิจกรรมนั้น (มีตัวอย่างที่ bootcamp) จะขึ้นก่อนรูปในแถบ
   ใช้ได้เฉพาะรูป .jpg .jpeg .png .webp (ไม่เกิน 3 MB) และคลิป .mp4 (ไม่เกิน 20 MB)
   เสร็จแล้วรัน  node tools/check-content.js  เพื่อตรวจว่าใส่ถูกไหม
   รายละเอียดอยู่ในไฟล์ วิธีเพิ่มรูป.md
  ================================================================
*/
(function (root) {
  root.SITE_CONTENT = {
    activities: {
      // สำเร็จการศึกษาหลักสูตรการยังชีพเบื้องต้น โรงเรียนการบิน
      'flight-school': {
        photos: [
          { file: 'assets/activities/flight-school/flight-school-01.jpg', caption: 'ฝึกการยังชีพในพื้นที่ป่า' },
          { file: 'assets/activities/flight-school/flight-school-02.jpg', caption: 'ก่อไฟสำหรับหุงหาอาหาร' },
          { file: 'assets/activities/flight-school/flight-school-03.jpg', caption: 'เตรียมอาหารด้วยหม้อสนาม' },
          { file: 'assets/activities/flight-school/flight-school-04.jpg', caption: 'อ่านแผนที่ด้วยเข็มทิศ' },
          { file: 'assets/activities/flight-school/flight-school-05.jpg', caption: 'ใช้คีมยกหม้อสนามบนกองไฟ' },
          { file: 'assets/activities/flight-school/flight-school-06.jpg', caption: 'อุปกรณ์และเสบียงยังชีพ' },
          { file: 'assets/activities/flight-school/flight-school-07.jpg', caption: 'สถานที่ฝึก' },
          { file: 'assets/activities/flight-school/flight-school-08.jpg', caption: 'รับเกียรติบัตรเมื่อจบหลักสูตร' },
        ]
      },
      // BOOTCAMP AI โดรน หุ่นยนต์ IoT
      'bootcamp': {
        videos: [
          { file: 'assets/activities/bootcamp/bootcamp-drone-video.mp4', poster: 'assets/activities/bootcamp/bootcamp-drone-video.jpg', caption: 'โดรนบินตามโค้ดที่เขียนสั่งผ่านโปรแกรม Swarm Lab' },
        ],
        photos: [
          { file: 'assets/activities/bootcamp/bootcamp-01.jpg', caption: 'เขียนโค้ดควบคุมโดรนด้วยโปรแกรม Swarm Lab' },
          { file: 'assets/activities/bootcamp/bootcamp-02.jpg', caption: 'ทดสอบสั่งโดรนบินบนแผนที่จำลอง' },
          { file: 'assets/activities/bootcamp/bootcamp-03.jpg', caption: 'ทีมช่วยกันตรวจโค้ดก่อนสั่งบิน' },
          { file: 'assets/activities/bootcamp/bootcamp-04.jpg', caption: 'ประกอบชิ้นส่วนโดรน' },
          { file: 'assets/activities/bootcamp/bootcamp-05.jpg', caption: 'ต่อวงจรบอร์ดควบคุม' },
          { file: 'assets/activities/bootcamp/bootcamp-06.jpg', caption: 'ใบพัดโดรน' },
          { file: 'assets/activities/bootcamp/bootcamp-07.jpg', caption: 'แบตเตอรี่โดรน' },
        ]
      },
      // ASEAN Drone Soccer Tournament 2026
      'drone-soccer': {
        photos: [
          { file: 'assets/activities/drone-soccer/drone-soccer-01.jpg', caption: 'บนเวทีพิธีมอบรางวัล ASEAN Drone Soccer Tournament 2026' },
          { file: 'assets/activities/drone-soccer/drone-soccer-02.jpg', caption: 'ถ่ายรูปรวมกับผู้เข้าร่วมในสนามแข่ง' },
          { file: 'assets/activities/drone-soccer/drone-soccer-03.jpg', caption: 'เหรียญ ASEAN Drone Soccer Tournament 2026' },
          { file: 'assets/activities/drone-soccer/drone-soccer-04.jpg', caption: 'สายคล้องคอและเสื้อของงาน' },
          { file: 'assets/activities/drone-soccer/drone-soccer-05.jpg', caption: 'สนามแข่งโดรนซอคเกอร์' },
          { file: 'assets/activities/drone-soccer/drone-soccer-06.jpg', caption: 'เตรียมโดรนในสนาม' },
          { file: 'assets/activities/drone-soccer/drone-soccer-07.jpg', caption: 'ระหว่างการแข่งขัน' },
          { file: 'assets/activities/drone-soccer/drone-soccer-08.jpg', caption: 'บรรยากาศรอบสนาม' },
          { file: 'assets/activities/drone-soccer/drone-soccer-09.jpg', caption: 'เตรียมอุปกรณ์โดรนก่อนลงสนาม' },
        ]
      },
      // International Youth Robot Competition Thailand 2026 (รองชนะเลิศอันดับ 2)
      'iyrc': {
        videos: [
          { file: 'assets/activities/iyrc/iyrc-noplan.mp4', poster: 'assets/activities/iyrc/iyrc-noplan.jpg', caption: 'คลิปสรุปการแข่งขันของทีม NoPlan ที่ IYRC Thailand 2026' },
          { file: 'assets/activities/iyrc/iyrc-clip-1.mp4', poster: 'assets/activities/iyrc/iyrc-clip-1.jpg', caption: 'ระหว่างการแข่งขัน Drone Soccer' },
          { file: 'assets/activities/iyrc/iyrc-clip-2.mp4', poster: 'assets/activities/iyrc/iyrc-clip-2.jpg', caption: 'บังคับโดรนผ่านด่านในสนาม' },
          { file: 'assets/activities/iyrc/iyrc-clip-3.mp4', poster: 'assets/activities/iyrc/iyrc-clip-3.jpg', caption: 'บังคับโดรนเข้าทำประตู' },
        ],
        photos: [
          { file: 'assets/activities/iyrc/iyrc-01.jpg', caption: 'ถ้วยรางวัลรองชนะเลิศอันดับ 2' },
          { file: 'assets/activities/iyrc/iyrc-02.jpg', caption: 'ขึ้นรับรางวัลบนเวที IYRC Thailand 2026' },
          { file: 'assets/activities/iyrc/iyrc-03.jpg', caption: 'ถ่ายรูปร่วมกันบนเวทีรับรางวัล' },
          { file: 'assets/activities/iyrc/iyrc-04.jpg', caption: 'กับเพื่อนร่วมทีม' },
          { file: 'assets/activities/iyrc/iyrc-05.jpg', caption: 'โดรนในลูกบอลโครงกรงที่ใช้แข่ง Drone Soccer' },
          { file: 'assets/activities/iyrc/iyrc-06.jpg', caption: 'บรรยากาศในงาน' },
          { file: 'assets/activities/iyrc/iyrc-07.jpg', caption: 'เตรียมตัวที่สนามแข่ง Drone Soccer' },
          { file: 'assets/activities/iyrc/iyrc-08.jpg', caption: 'สนามแข่ง Drone Soccer' },
          { file: 'assets/activities/iyrc/iyrc-09.jpg', caption: 'บรรยากาศสนามแข่งขัน' },
          { file: 'assets/activities/iyrc/iyrc-10.jpg', caption: 'สนามแข่งหุ่นยนต์ประเภทอื่นในงาน' },
          { file: 'assets/activities/iyrc/iyrc-11.jpg', caption: 'ผู้ชมรอบสนามแข่งขัน' },
        ]
      }
    },

    // คลิปวิดีโอ (แสดงในหัวข้อ CONTACT)
    videos: [
      { file: 'assets/videos/march.mp4', poster: 'assets/videos/march-poster.jpg', caption: 'สวัสดีจากมาร์ช' },
      // { file: 'assets/videos/me.mp4', poster: 'assets/videos/me.jpg', caption: 'แนะนำตัว' },
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SITE_CONTENT;
})(typeof window !== 'undefined' ? window : globalThis);
