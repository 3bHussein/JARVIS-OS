# 09 — Ask about your saved data

Unlock JARVIS, let the daily workspace load, then use the conversation box on Today. These supported questions use the same selected sources as Home and run in the browser without a generative model.

| Ask in English | Ask in Egyptian Arabic | Result |
| --- | --- | --- |
| What should I start with? | أبدأ بإيه؟ | The recorded next-step list, not an AI importance score |
| How many calories are left? | فاضل كام سعر؟ | Selected food total versus your usable chosen target, with source and date |
| How many hours did I sleep? | نمت كام ساعة؟ | The selected WHOOP or manual sleep source, explicitly labelled |
| What is my next appointment? | موعدي الجاي؟ | The next actual future timed Planner entry, with configured timezone |
| When is my next workout? | التمرين امتى؟ | A timed workout in Planner; weekday training labels never become invented times |
| Show my notes | ملاحظاتي | Up to three open untimed notes, plus total count |
| Summarize my day | لخص يومي | Recorded daily briefing and source/missing-data statements |

Replies use your selected interface language; recognized input wording can be Arabic or English. Clock questions are distinguished from questions about a recorded appointment/workout time.

## Use the quick questions

Click a suggestion to put it in the input. It does not send automatically. Review it and press **Send**. Reviewed speech drafts use the same input and still require Send. Use **Read reply aloud** if needed; existing device/network voice permissions apply.

## Understand the limits

- This is a bounded saved-data query router, not general conversational intelligence or guaranteed Egyptian-dialect transcription. Unsupported questions keep the existing help response.
- Home source controls also drive answers. Online defaults to cloud food and WHOOP sleep; manual input requires an explicit choice. Cloud/file food must be selected on Home to drive its budget answer. Unavailable selected data is not replaced by a different manual/file total. Zero is distinct from unknown; missing targets are not invented. Food expenditure is not added to intake or to your target.
- Freshness and local date are checked at question time. Old WHOOP readings do not become current because an old chat question is repeated. Queries do not trigger a source sync or fetch extra records.
- No appointment means none is recorded, not that you are free. A weekly training label has no appointment time.
- Requests to create, edit or delete records are refused by the saved-data router. Use Planner/Check-in and their normal review/confirmation controls.
- Replies remain in unlocked-session conversation state. Lock clears the private context; no localStorage or long-term memory is added. Data is not silently sent to an AI provider. Optional Ollama mode remains separate, with its existing consent controls and generated-response limitations; quick saved-data suggestions are hidden in that mode.
- Clear conversation removes local messages immediately. An older clear acknowledgement cannot erase a newer saved-data answer. The explicit cloud chat-clear route still requires workspace authentication and CSRF.

Actual source-account sign-in and data availability still need owner acceptance in Sources. Never paste account passwords, recovery codes or WHOOP sign-in links into chat.
