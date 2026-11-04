CREATE OR REPLACE FUNCTION set_complaint_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'Replaced' AND NEW.status = 'Replaced' THEN
    NEW.updated_at = OLD.updated_at;
  ELSE
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_complaints_updated_at ON complaints;
CREATE TRIGGER set_complaints_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW EXECUTE FUNCTION set_complaint_updated_at();
