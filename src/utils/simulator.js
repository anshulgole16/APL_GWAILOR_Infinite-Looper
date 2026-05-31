export const SIMULATOR = {
  coach: (query, mode) => {
    const lower = query.toLowerCase();
    
    // Spin bowling query (Killer Demo Flow support)
    if (lower.includes("spin") || lower.includes("spin bowling") || lower.includes("struggle against spin")) {
      return `## 🔍 Weakness Analysis
Your root cause is playing **spin off the pitch** instead of reading it out of the hand. You are lunging forward blindly, keeping your hands stiff and closing your stance early. This restricts your back-foot release and leaves you highly vulnerable to both under-cutting off-breaks and sliding arm-balls.

## 🏋️ Drill Plan
1. **The Wrist-Watch Drill (Shadow Focus)**
   - Have a partner stand 10 yards away and feed spinners. Instead of hitting, you must verbally call out the spin direction (e.g., "Leggie", "Offie") the moment it leaves the wrist. Focus strictly on the bowler's fingers and release point. *Do this for 30 deliveries.*
2. **One-Step Dance Charge**
   - Place a marker 2 steps forward. Practice stepping out as the ball is delivered, keeping a low center of gravity and soft hands to smother the spin right at its pitch. *Perform 4 sets of 10 step-outs.*
3. **Double-Tee Ground Sweep**
   - Place two batting tees at sweet sweep zones. Practice sweeping down on the ball, keeping your head over your front knee to avoid top-edges. *Sweep 25 times.*

## ⚡ Key Tips
- **Watch the Seam & Wrist:** Observe the angle of the seam and the release side of the bowler's hand.
- **Soft Hands:** Keep your bottom hand extremely light to ensure that edge deliveries drop safely rather than flying to slips.
- **Utilize Your Crease:** Go deep inside your crease to buy extra milliseconds to read the trajectory of bouncing deliveries.

## 🌟 Pro Reference
Recall **Sachin Tendulkar's** masterclass against Shane Warne in Chennai (1998). Sachin neutralised the sharp turn by constantly stepping out and playing against the spin with controlled, soft wrist extension.

## 💪 Coach's Word
"Beta, spin is never played with muscle or power. It is played with high-level intelligence and quick footwork. Release the tension in your wrists, watch the ball closely, and dictate the game!"`;
    }

    // Yorker query
    if (lower.includes("yorker") || lower.includes("yorker khelne") || lower.includes("struggle against yorker")) {
      return `## 🔍 Weakness Analysis
Your primary issue is a **high and heavy backlift** coupled with late wrist release. Because your bat is starting from a elevated position, you are unable to swing down fast enough to meet the ball at the base, resulting in late defense, jammed toes, or getting bowled under the bat.

## 🏋️ Drill Plan
1. **Base-Stump Slammer Drill**
   - Setup a batting stance with your bat already resting flat on the ground inside the crease. Have a partner drop high-density balls from a short distance. Focus on slamming down directly from the ground setup with zero backlift. *3 sets of 15 repetitions.*
2. **Under-Arm Speed Jamming**
   - Partner bowls under-arm rapid yorkers from 10 yards. Your sole goal is to jam the ball out, aiming to hit it directly back to the bowler. *Practise for 30 deliveries.*
3. **Heavy Bat Pickups**
   - Swing a slightly heavier bat in a straight downswing path. This strengthens your wrists and speeds up your bat drop. *Perform 20 downswings daily.*

## ⚡ Key Tips
- **Deep Guard:** Batter up slightly deeper in your crease (2-3 inches behind standard) to buy critical milliseconds of reaction time.
- **Keep Head Still:** Avoid lunging too far forward. Stablize your head over the line of the ball.
- **Low Backlift:** When you expect a yorker (e.g. death overs), lower your backlift trigger height by 50% for instant pickup.

## 🌟 Pro Reference
Look at how **MS Dhoni** handles toe-crushing yorkers from Lasith Malinga. He keeps an exceptionally low backlift, stays deep in the crease, and uses a lightning-fast downward wrist snap to whip the ball away.

## 💪 Coach's Word
"Digging out a yorker is a game of supreme focus. Don't look to smash it out of the park. Respect the ball, jam it down with fast wrists, and the runs will flow!"`;
    }

    // Generic Coach fallbacks based on role
    if (mode === "batter") {
      return `## 🔍 Weakness Analysis
Based on your input, you are likely suffering from standard balance issues, closing your hips too fast, or failing to transfer your body weight properly onto the front foot.

## 🏋️ Drill Plan
1. **Front-Foot Balance Drop** (25 reps): Practice stepping forward and holding your final pose for 3 seconds to build leg strength.
2. **One-Handed Swing Paths** (15 reps): Use only your top hand to swing, keeping the bat face perfectly vertical.
3. **Partner Short Ball Jams** (30 balls): Practice defending quick rising deliveries.

## ⚡ Key Tips
- Keep your head leading into the shot at all times.
- Keep your grip firm in the top hand and feather-light in your bottom hand.
- Maintain a stable base with feet shoulder-width apart.

## 🌟 Pro Reference
Watch **Kane Williamson** play under his eyes. He plays extremely late and close to his body to maintain complete control.

## 💪 Coach's Word
"A solid defense is the foundation of every great batsman. Get your head right over the ball and control the pitch!"`;
    } else if (mode === "bowler") {
      return `## 🔍 Weakness Analysis
You are losing control over your wrist release angle at the point of delivery, leading to inconsistent lines or loss of swing.

## 🏋️ Drill Plan
1. **Wrist Snap Target Practice** (20 throws): Release the ball against a wall focusing on perfect back-spin.
2. **Spot Bowling** (30 deliveries): Place a coin/marker on a good length and try to hit it repeatedly.
3. **Run-up Cadence Drills**: Match your footstep rhythm to build momentum.

## ⚡ Key Tips
- Lock your front knee at release to act as a pivot.
- Pull down hard with your non-bowling arm.
- Watch your target till the very last millisecond.

## 🌟 Pro Reference
Think of **James Anderson** and his legendary wrist seam positioning which allows him to swing the ball at will.

## 💪 Coach's Word
"Bowling is all about repeatability. Run in hard, lock that wrist, and hit your spots relentlessly!"`;
    } else if (mode === "captain") {
      return `## 🔍 Weakness Analysis
You need to improve your situational awareness, field organization, and reading the batsman's foot triggers.

## 🏋️ Drill Plan
1. **Dynamic Field Mapping Grid** (10 setups): Setup defensive fields for different batsmen profiles.
2. **Reactions & DRS Reflex Drill** (20 reps): Immediate calls on review logic.
3. **Match Simulation Runs**: Simulate scenarios with specific run-rate limits.

## ⚡ Key Tips
- Observe the batsman's back-foot position to predict their next shot.
- Rotate your bowlers in short, sharp spells.
- Keep encouraging your fielders to keep the pressure high.

## 🌟 Pro Reference
Observe **MS Dhoni's** cool tactical changes under intense pressure during the ICC finals.

## 💪 Coach's Word
"A great leader doesn't react to the game, he anticipates it. Stay one step ahead of the batsman!"`;
    } else {
      return `## 🔍 Weakness Analysis
You are dropping catch opportunities or showing slow responses behind the stumps off spinning bounce.

## 🏋️ Drill Plan
1. **Low-Catch Reflex Claps** (25 reps): Catch dynamic deflection boards standing up close.
2. **Blind Spot takes**: Partner deflects balls off a slide sheet.
3. **Stump whip snaps**: Perfect gloves-to-bail transition speed.

## ⚡ Key Tips
- Keep hands low and fingers wide pointing down.
- Follow the ball in hand with head lock down.
- Rise naturally with bounce, never stand early.

## 🌟 Pro Reference
Recall **Adam Gilchrist's** lightning stumping reflexes standing up to Shane Warne's leg-breaks.

## 💪 Coach's Word
"Keepers are key strategy makers. Stay alert, stay low, and capture every micro edge!"`;
    }
  },
  strategy: (form) => {
    const role = form.role || "batting";
    const pitch = form.pitch || "Flat";
    const opponent = form.opponent || "Balanced Squad";
    const overs = parseInt(form.overs) || 10;
    const wickets = parseInt(form.wickets) || 2;

    if (role === "batting") {
      if (overs <= 5) {
        return `## 🎯 Situation Read
We are in the **Final Death Overs** with ${overs} overs remaining and ${wickets} wickets down. The pressure is on! The ${pitch} pitch is offering medium assistance, but now is the time to speed up the run rate.

## 📋 Primary Strategy
Adopt an **Ultra-Aggressive Attack Mode**. You must target specific short boundaries, stand deeper inside your crease to convert yorkers into full-tosses, and exploit the pace of the bowler.

## ⚡ Key Tactics
- **Base Cleared Stance:** Back away slightly leg-side to open up access to the off-side field.
- **Target the Slower Ball:** Look for changes in bowler's wrist action and pull forcefully over mid-wicket.
- **Paddle Sweep Exploits:** Utilize fine leg gaps if the bowler targets the stumps.
- **Run Hard:** Turn every single run into a brace to keep the fielders under immense pressure.

## 🎲 If Plan A Fails
If the bowler bowls perfect yorkers, pivot to dynamic lap shots and smart dabs to exploit deep third man and fine leg gaps.

## 🏆 Win Condition
Target scoring at least **12-14 runs per over** to mount a match-winning score!`;
      } else {
        return `## 🎯 Situation Read
We are in the **Middle Overs phase** with ${overs} overs left and ${wickets} wickets down. The ${pitch} pitch is playing typical for its condition, and the ${opponent} opponent is trying to dry up the runs.

## 📋 Primary Strategy
Adopt a **Calculated Risk Strategy**. We need to build a solid partnership, rotate the strike regularly to avoid dot ball pressure, and select 1 boundary option per over.

## ⚡ Key Tactics
- **Work the Gaps:** Tap and run into the deep cover and mid-wicket gaps.
- **Target the Weakest Link:** Attack the opponent's 5th bowler.
- **Inside-Out Lofting:** Play spinners against the turn over extra cover.
- **Sweep with Control:** Smother spin with down-sweeps.

## 🎲 If Plan A Fails
If wickets fall consecutively, drop aggression to 30%, build a 4-over block partnership, and save wickets for the final 3 overs.

## 🏆 Win Condition
Keep the scorecard ticking at **8 runs per over** while maintaining wicket safety.`;
      }
    } else {
      // Bowling strategy
      if (overs <= 5) {
        return `## 🎯 Situation Read
Death overs are underway. Opponent is looking to smash every delivery. We have ${overs} overs to defend with ${wickets} wickets taken so far on this ${pitch} pitch.

## 📋 Primary Strategy
Deploy **Extreme Death Defensive Tactics**. Dry up their hitting zones. Pacemen should bowl wide yorkers or slower ball bouncers. Spinners should fire it into the blockhole.

## ⚡ Key Tactics
- **Wide Yorker Line:** Guide deliveries well outside off-stump to keep the ball away from the swing arc.
- **Slower Ball Off-Cutters:** Roll fingers off the seam to grip into the turf.
- **Deep Boundary Protection:** Keep deep mid-wicket, long-on, and deep square leg back.
- **Vary the Pace:** Do not deliver two consecutive balls at the same velocity.

## 🎲 If Plan A Fails
Switch to round-the-wicket angling into the ribs to restrict the batsman's arm extension.

## 🏆 Win Condition
Restrict opponent scoring to under **8 runs per over** in these final overs.`;
      } else {
        return `## 🎯 Situation Read
Middle overs strangle. Opponent is looking to rebuild. Pitch is ${pitch} which favors ${pitch.includes("Spin") ? "spinners" : "controlled length"}.

## 📋 Primary Strategy
Deploy **Squeeze & Trap Tactics**. Bowl stump-to-stump, dry up singles, and build up pressure to force a big, desperate shot.

## ⚡ Key Tactics
- **Stump Line Attacks:** Force the batsman to play straight and risk LBW.
- **In-and-Out Field Setups:** Keep 3 boundary riders and 5 saving-single infielders.
- **Change the Angles:** Go wide of the crease to create awkward release points.
- **Bowl to the Field:** Make sure bowlers bowl strictly to the agreed field.

## 🎲 If Plan A Fails
Bring in your strike pace bowler for a short 1-over aggressive short-ball burst to break the partnership.

## 🏆 Win Condition
Maintain a dot-ball percentage above **45%** to induce a forced error.`;
      }
    }
  },
  commentary: (event) => {
    const ev = event.toLowerCase();
    
    if (ev.includes("six") || ev.includes("lands in the crowd") || ev.includes("sixer")) {
      return "UNBELIEVABLE SCENES! He has picked that up beautifully! Up, up, and away! That is miles into the stands, absolutely out of here! Smashed like a tracer bullet! What a sensational hit!";
    }
    if (ev.includes("four") || ev.includes("boundary") || ev.includes("drive four")) {
      return "SHOT! Absolute class from the batsman! A gentle leaning drive through the covers, pure elegance. The outfield is quick, no fielder has a chance! That is boundary-writing at its absolute best! Wah wah, maza aa gaya!";
    }
    if (ev.includes("wicket") || ev.includes("caught") || ev.includes("out")) {
      return "OUT! HE IS GONE! A colossal breakthrough! Stumps flying or caught in deep mid-on! Look at the celebrations! The stadium has erupted! A massive body blow to the batting side!";
    }
    if (ev.includes("yorker") || ev.includes("dot ball") || ev.includes("blockhole")) {
      return "CRACKING DELIVERY! Right in the blockhole! The batsman just managed to jam his bat down to save his toes. Brilliant execution! Absolute pressure cooker atmosphere here. No run, dot ball, gold dust!";
    }
    if (ev.includes("century") || ev.includes("hundred")) {
      return "ON YOUR FEET, LADIES AND GENTLEMEN! A MAGNIFICENT HUNDRED! The bat goes up, the helmet is off, and the crowd goes wild! Pure batting masterclass. What a moment of history! An innings to cherish forever!";
    }
    if (ev.includes("review") || ev.includes("lbw")) {
      return "OH, BIG SHOUT! The bowler is convinced, but the umpire says no! They are going upstairs! The crowd holds its breath. UltraEdge loading... this is extremely close, ladies and gentlemen! Excitement reaches fever pitch!";
    }
    
    return "OH MY WORD! What an absolutely dramatic moment on the pitch! The tension is thick enough to cut with a knife! Cricket at its finest under the stadium lights, the fans are screaming their lungs out!";
  }
};
