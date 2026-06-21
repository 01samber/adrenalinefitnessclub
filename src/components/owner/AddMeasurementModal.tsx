"use client";

import { FormEvent, useEffect, useState } from "react";
import { MeasurementForm } from "@/components/owner/MeasurementForm";
import { Button } from "@/components/ui/Button";
import { apiPost } from "@/lib/api-client";
import {
  createInitialMeasurementFormValues,
  resolveMeasurementErrorMessage,
  toCreateMeasurementPayload,
  validateMeasurementForm,
  type MeasurementFormErrors,
  type MeasurementFormValues,
} from "@/lib/measurement-form";
import type { CreateMeasurementResponse } from "@/types/api";

interface AddMeasurementModalProps {
  open: boolean;
  clientId: string;
  clientName: string;
  profileHeightCm?: string | number | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AddMeasurementModal({
  open,
  clientId,
  clientName,
  profileHeightCm,
  onClose,
  onSuccess,
}: AddMeasurementModalProps) {
  const [values, setValues] = useState<MeasurementFormValues>(() =>
    createInitialMeasurementFormValues(profileHeightCm),
  );
  const [fieldErrors, setFieldErrors] = useState<MeasurementFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, loading, onClose]);

  function updateField<K extends keyof MeasurementFormValues>(
    key: K,
    value: MeasurementFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const errors = validateMeasurementForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const payload = toCreateMeasurementPayload(values);
      await apiPost<CreateMeasurementResponse>(
        `/api/owner/clients/${clientId}/measurements`,
        payload,
      );
      onSuccess("Measurement added successfully.");
      onClose();
    } catch (error) {
      setSubmitError(resolveMeasurementErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="afc-measurement-modal"
      role="presentation"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="afc-measurement-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-measurement-title"
        aria-describedby="add-measurement-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="afc-measurement-modal__accent" aria-hidden />

        <header className="afc-measurement-modal__header">
          <p className="afc-measurement-modal__kicker">Progress tracking</p>
          <h2 id="add-measurement-title" className="afc-measurement-modal__title">
            Add Body Measurement
          </h2>
          <p id="add-measurement-subtitle" className="afc-measurement-modal__subtitle">
            Record the athlete&apos;s latest progress metrics and coach assessment.
          </p>
          <p className="afc-measurement-modal__client">{clientName}</p>
        </header>

        {submitError ? (
          <div className="afc-measurement-modal__error" role="alert">
            {submitError}
          </div>
        ) : null}

        <form className="afc-measurement-modal__form" onSubmit={handleSubmit} noValidate>
          <MeasurementForm
            values={values}
            errors={fieldErrors}
            onChange={updateField}
            disabled={loading}
          />

          <div className="afc-measurement-modal__actions">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
            >
              {loading ? "Saving measurement..." : "Save measurement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
