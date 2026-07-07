"use client";

import { FormEvent, useEffect, useState } from "react";
import { EditClientProfileForm } from "@/components/owner/EditClientProfileForm";
import { Button } from "@/components/ui/Button";
import { ApiClientError, apiPatch } from "@/lib/api-client";
import {
  createEditClientFormValues,
  resolveUpdateClientErrorMessage,
  toUpdateClientPayload,
  validateEditClientForm,
  type EditClientFormErrors,
  type EditClientFormValues,
} from "@/lib/edit-client-form";
import type { OwnerClientDetail, UpdateClientResponse } from "@/types/api";

interface EditClientProfileModalProps {
  open: boolean;
  client: OwnerClientDetail;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function EditClientProfileModal({
  open,
  client,
  onClose,
  onSuccess,
}: EditClientProfileModalProps) {
  const [values, setValues] = useState<EditClientFormValues>(() =>
    createEditClientFormValues(client),
  );
  const [fieldErrors, setFieldErrors] = useState<EditClientFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, loading, onClose]);

  function updateField<K extends keyof EditClientFormValues>(
    key: K,
    value: EditClientFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const errors = validateEditClientForm(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await apiPatch<UpdateClientResponse>(
        `/api/owner/clients/${client.user.id}`,
        toUpdateClientPayload(values),
      );
      onSuccess("Athlete profile updated successfully.");
      onClose();
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(resolveUpdateClientErrorMessage(error));
      } else {
        setSubmitError(resolveUpdateClientErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

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
        aria-labelledby="edit-client-profile-title"
        aria-describedby="edit-client-profile-subtitle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="afc-measurement-modal__accent" aria-hidden />

        <header className="afc-measurement-modal__header">
          <p className="afc-measurement-modal__kicker">Athlete management</p>
          <h2 id="edit-client-profile-title" className="afc-measurement-modal__title">
            Edit Athlete Profile
          </h2>
          <p id="edit-client-profile-subtitle" className="afc-measurement-modal__subtitle">
            Update athlete details, training profile, health notes, and emergency contact.
          </p>
          <p className="afc-measurement-modal__client">{client.user.fullName}</p>
        </header>

        {submitError ? (
          <div className="afc-measurement-modal__error" role="alert">
            {submitError}
          </div>
        ) : null}

        <form className="afc-measurement-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="afc-measurement-modal__body afc-modal-scroll">
            <EditClientProfileForm
              values={values}
              errors={fieldErrors}
              disabled={loading}
              onChange={updateField}
            />
          </div>

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
            <Button type="submit" variant="primary" size="md" loading={loading}>
              {loading ? "Saving profile..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
