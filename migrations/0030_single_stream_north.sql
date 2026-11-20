-- Move all learners and marks to North streams only (single stream per grade)
-- Grade 7 was on SOUTH; Grades 8/9 already mostly NORTH.

update learners set stream_id = 'g7n' where grade_id = 'g7' and stream_id = 'g7s';
update learners set stream_id = 'g8n' where grade_id = 'g8' and stream_id = 'g8s';
update learners set stream_id = 'g9n' where grade_id = 'g9' and stream_id = 'g9s';

update marks set stream_id = 'g7n' where grade_id = 'g7' and stream_id = 'g7s';
update marks set stream_id = 'g8n' where grade_id = 'g8' and stream_id = 'g8s';
update marks set stream_id = 'g9n' where grade_id = 'g9' and stream_id = 'g9s';

-- Optionally keep South stream definitions but unused; or remove if desired.
-- Leaving stream rows intact so historical references remain valid if any.

-- Ensure class teachers point to North
update streams set class_teacher_label = 'MD. BELINDA MIROYO' where id = 'g7n';
update streams set class_teacher_label = 'TR. BRIAN NDICHI' where id = 'g8n';
update streams set class_teacher_label = 'MD. WAMBOI EUNICE' where id = 'g9n';
